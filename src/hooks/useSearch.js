/**
 * hooks/useSearch.js — Búsqueda multi-API unificada
 * ══════════════════════════════════════════════════════════════
 *
 * Hoy hace 5 requests en paralelo (TMDB, Jikan, OpenLibrary, IGDB, MusicBrainz).
 * Las que fallan se descartan silenciosamente con Promise.allSettled.
 *
 * ── INTEGRACIÓN DEL BACKEND ───────────────────────────────────
 *
 * Con backend propio, reemplazar TODO el queryFn de useSearch por:
 *
 *   queryFn: () => apiFetch(
 *     `${import.meta.env.VITE_API_BASE_URL}/api/search?q=${query}&type=${type}`
 *   )
 *
 * El backend:
 *  1. Hace los 5 requests en paralelo (con acceso a claves secretas)
 *  2. Normaliza al modelo Obra
 *  3. Cachea en la tabla `obras` de PostgreSQL
 *  4. Retorna Obra[] directamente — los hooks y componentes no cambian
 *
 * TABLA DE DB RELACIONADA: obras (para caché), obra_genres, obra_platforms
 *
 * @module hooks/useSearch
 */

import { useQuery }                      from '@tanstack/react-query';
import { searchMovies, searchSeries }    from '@/services/tmdb';
import { searchAnime }                   from '@/services/jikan';
import { searchBooks }                   from '@/services/openLibrary';
import { searchGames, searchGamesForSaga } from '@/services/rawg';
import { searchMusicReleaseGroups }      from '@/services/musicbrainz';
import { buscarProductosNoLimits } from '@/services/productos';
import {
  normalizeTmdbMovie,
  normalizeTmdbSeries,
  normalizeJikanAnime,
  normalizeOpenLibraryBook,
  normalizeRawgGame,
  normalizeMusicBrainzRelease,
} from '@/utils/normalizeMedia';
import { MEDIA_TYPES } from '@/utils/constants';

/**
 * Busca en todas las fuentes disponibles según el tipo de filtro.
 *
 * @param {string} query  — Término de búsqueda ingresado por el usuario
 * @param {string} type   — 'all' | MEDIA_TYPES.* (filtra por fuente)
 * @returns {import('@tanstack/react-query').UseQueryResult<Obra[]>}
 */
export function useSearch(query, type = 'all') {
  return useQuery({
    queryKey: ['search', query, type],

    queryFn: async () => {
      if (!query?.trim()) return [];

      // Construye las tareas según el filtro activo.
      // Con backend: reemplazar TODO este bloque por una sola llamada.
      const tasks = [];

      if (type === 'all' || type === MEDIA_TYPES.MOVIE) {
        tasks.push(searchMovies(query).then((r) => r.results.map(normalizeTmdbMovie)));
      }
      if (type === 'all' || type === MEDIA_TYPES.SERIES) {
        tasks.push(searchSeries(query).then((r) => r.results.map(normalizeTmdbSeries)));
      }
      if (type === 'all' || type === MEDIA_TYPES.ANIME) {
        tasks.push(searchAnime(query).then((r) => r.data.map(normalizeJikanAnime)));
      }
      if (type === 'all' || type === MEDIA_TYPES.BOOK) {
        tasks.push(searchBooks(query).then((r) => (r.docs ?? []).map(normalizeOpenLibraryBook)));
      }
      if (type === 'all' || type === MEDIA_TYPES.GAME) {
        tasks.push(searchGames(query).then((r) => 
          (r.results ?? [])
            .map(normalizeRawgGame)
            .filter((g) => g.poster && g.rating !== '—' && parseFloat(g.rating) >= 6)
        ));
      }
      if (type === 'all' || type === MEDIA_TYPES.MUSIC) {
        tasks.push(
          searchMusicReleaseGroups(query).then(
            (r) => (r['release-groups'] ?? []).map(normalizeMusicBrainzRelease)
          )
        );
      }

      if (type === 'all') {
        tasks.push(buscarProductosNoLimits(query));
      }

      // Promise.allSettled: si Jikan falla (rate limit), igual muestra TMDB e IGDB.
      const settled = await Promise.allSettled(tasks);
      return settled
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value);
    },

    enabled:   Boolean(query?.trim()),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

/**
 * Agrega TODO el contenido relacionado con una franquicia desde todas las fuentes.
 * Retorna los resultados agrupados por tipo para la página /saga/:name.
 *
 * Con backend: reemplazar por GET /api/saga/:name que retorna el mismo shape.
 *
 * @param {string|null} sagaName — Nombre de la franquicia (ej: "Spider-Man")
 * @returns {{ grouped: Record<string, Obra[]>, isLoading: boolean, error: Error|null }}
 */
export function useSagaSearch(sagaName) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['saga', sagaName],

    queryFn: async () => {
      if (!sagaName?.trim()) return {};

      const [movies, series, anime, books, games, music] = await Promise.allSettled([
        Promise.all([searchMovies(sagaName, 1), searchMovies(sagaName, 2)])
          .then(([p1, p2]) => [...p1.results, ...p2.results].map(normalizeTmdbMovie)),
        Promise.all([searchSeries(sagaName, 1), searchSeries(sagaName, 2)])
          .then(([p1, p2]) => [...p1.results, ...p2.results].map(normalizeTmdbSeries)),
        searchAnime(sagaName).then((r) => r.data.map(normalizeJikanAnime)),
        searchBooks(sagaName).then((r) => (r.docs ?? []).map(normalizeOpenLibraryBook)),
        searchGamesForSaga(sagaName).then((r) =>
          (r.results ?? [])
            .map(normalizeRawgGame)
            .filter((g) => {
              const title = g.title.toLowerCase();
              const saga  = sagaName.toLowerCase();
              const excluded = ['virtual reality', 'pc port', 'amazing spider-man 2'];
              return title.includes(saga) && !excluded.some((e) => title.includes(e));
            })
            .sort((a, b) => parseFloat(b.rating ?? '0') - parseFloat(a.rating ?? '0'))
        ),
        searchMusicReleaseGroups(sagaName).then(
          (r) => (r['release-groups'] ?? []).map(normalizeMusicBrainzRelease)
        ),
      ]);

      const minRating = 6;
      const filterAndSort = (arr, isMusic = false) => {
        const filtered = arr
          .filter((o) => isMusic || o.poster)
          .filter((o) => isMusic || (o.rating !== '—' && parseFloat(o.rating) >= minRating && parseFloat(o.rating) < 9.5))
          .filter((o) => !o.year || o.year === '—' || parseInt(o.year) >= 1970)
          .filter((o) => o.source !== 'tmdb' || (o.voteCount ?? 0) >= 200);
        return filtered.sort((a, b) => (b.year ?? '0').localeCompare(a.year ?? '0'));
      };

      return {
        movies: movies.status === 'fulfilled' ? filterAndSort(movies.value) : [], 
        series: series.status === 'fulfilled' ? filterAndSort(series.value) : [],
        anime:  anime.status  === 'fulfilled' ? filterAndSort(anime.value)  : [],
        books:  books.status  === 'fulfilled' ? filterAndSort(books.value)  : [],
        games:  games.status  === 'fulfilled' ? filterAndSort(games.value)  : [],
        music:  music.status  === 'fulfilled' ? filterAndSort(music.value, true) : [],
      };
    },

    enabled:   Boolean(sagaName?.trim()),
    staleTime: 5 * 60 * 1000,
  });

  return { grouped: data ?? {}, isLoading, error };
}
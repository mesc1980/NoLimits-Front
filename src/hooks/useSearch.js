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
  normalizeGoogleBook,
  normalizeRawgGame,
  normalizeMusicBrainzRelease,
} from '@/utils/normalizeMedia';
import { MEDIA_TYPES } from '@/utils/constants';

function normalizeQuery(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Busca en todas las fuentes disponibles según el tipo de filtro.
 *
 * @param {string} query  — Término de búsqueda ingresado por el usuario
 * @param {string} type   — 'all' | MEDIA_TYPES.* (filtra por fuente)
 * @returns {import('@tanstack/react-query').UseQueryResult<Obra[]>}
 */
export function useSearch(query, type = 'all') {
  return useQuery({
    queryKey: ['search', normalizeQuery(query), type],

    queryFn: async () => {
      if (!query?.trim()) return [];

      // Construye las tareas según el filtro activo.
      // Con backend: reemplazar TODO este bloque por una sola llamada.
      const tasks = [];

      const q = normalizeQuery(query).toLowerCase();
      const byTitle = (a) => normalizeQuery(a.title ?? '').toLowerCase().includes(q);

      if (type === 'all' || type === MEDIA_TYPES.MOVIE) {
        tasks.push(
          searchMovies(normalizeQuery(query)).then((r) =>
            r.results
              .map(normalizeTmdbMovie)
              .filter((m) => {
                const title = normalizeQuery(m.title ?? '').toLowerCase();
                const words = q.split(' ').filter((w) => w.length > 2);
                const isRelevant = title.includes(q) || words.every((w) => title.includes(w));
                return m.poster && (m.voteCount ?? 0) >= 50 && isRelevant;
              })
              .slice(0, 18)
          )
        );
      }

      if (type === 'all' || type === MEDIA_TYPES.SERIES) {
        tasks.push(
          searchSeries(normalizeQuery(query)).then((r) =>
            r.results
              .map(normalizeTmdbSeries)
              .filter((s) => {
                const title = normalizeQuery(s.title ?? '').toLowerCase();
                const words = q.split(' ').filter((w) => w.length > 2);
                const isRelevant = title.includes(q) || words.every((w) => title.includes(w));
                return s.poster && (s.voteCount ?? 0) >= 50 && isRelevant;
              })
              .slice(0, 18)
          )
        );
      }

      if (type === 'all' || type === MEDIA_TYPES.ANIME) {
        tasks.push(
          searchAnime(normalizeQuery(query)).then((r) =>
            r.data
              .map(normalizeJikanAnime)
              .filter((a) => byTitle(a) && a.poster)
              .slice(0, 18)
          )
        );
      }

      if (type === 'all' || type === MEDIA_TYPES.BOOK) {
        tasks.push(
          searchBooks(normalizeQuery(query)).then((r) =>
            (r.items ?? [])
              .map(normalizeGoogleBook)
              .filter((b) => {
                const title = normalizeQuery(b.title ?? '').toLowerCase();
                const words = q.split(' ').filter((w) => w.length > 3);
                return title.includes(q) || words.every((word) => title.includes(word));
              })
              .slice(0, 18)
          ),
        );
      }

      if (type === 'all' || type === MEDIA_TYPES.GAME) {
        tasks.push(
          searchGames(normalizeQuery(query)).then((r) =>
            (r.results ?? [])
              .map(normalizeRawgGame)
              .filter((g) => {
                const title = normalizeQuery(g.title ?? '').toLowerCase();
                const words = q.split(' ').filter((w) => w.length > 1);
                if (words.length === 0) return true;
                const matches = words.filter((w) => title.includes(w));
                const score = matches.length / words.length;
                return g.poster && g.rating !== '—' && parseFloat(g.rating) >= 7 && score >= 0.8;
              })
              .slice(0, 18)
          )
        );
      }

      if (type === 'all' || type === MEDIA_TYPES.MUSIC) {
        tasks.push(
          searchMusicReleaseGroups(normalizeQuery(query)).then((r) =>
            (r['release-groups'] ?? [])
              .map(normalizeMusicBrainzRelease)
              .filter(byTitle)
              .slice(0, 18)
          )
        );
      }

      if (type === 'all') {
        tasks.push(buscarProductosNoLimits(normalizeQuery(query)));
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
export function useSagaSearch(sagaName, searchAlias, displayName) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['saga', sagaName, searchAlias, displayName],

    queryFn: async () => {
      if (!sagaName?.trim()) return {};

      const sq = sagaName.toLowerCase();
      const byTitle = (a) => a.title?.toLowerCase().includes(sq);
      const excluded = ['virtual reality', 'pc port', 'amazing spider-man 2'];
      const excludedIds = ['tmdb:movie:1033219', 'jikan:anime:49739'];
      const searchName = searchAlias ?? sagaName;
      const displaySq = displayName?.toLowerCase() ?? sq;

      const [movies, series, anime, books, games, music] = await Promise.allSettled([
      Promise.all([searchMovies(searchName, 1), searchMovies(searchName, 2)])
        .then(([p1, p2]) => {
          const searchSq = searchName.toLowerCase();
          return [...p1.results, ...p2.results]
            .map(normalizeTmdbMovie)
            .filter((m) => m.poster && (m.voteCount ?? 0) >= 100 && 
              !excludedIds.includes(m.id) && (
              m.title?.toLowerCase().includes(sq) ||
              m.title?.toLowerCase().includes(searchSq) ||
              m.title?.toLowerCase().includes(displaySq)
            ))
        }),
      Promise.all([searchSeries(searchName, 1), searchSeries(searchName, 2)])
        .then(([p1, p2]) => {
          const searchSq = searchName.toLowerCase();
          return [...p1.results, ...p2.results]
            .map(normalizeTmdbSeries)
            .filter((s) => s.poster && (
              s.title?.toLowerCase().includes(sq) ||
              s.title?.toLowerCase().includes(searchSq) ||
              s.title?.toLowerCase().includes(displaySq)
            ))
        }),
        searchAnime(sagaName).then((r) =>
          r.data
            .map(normalizeJikanAnime)
            .filter((a) => byTitle(a) && a.poster && !excludedIds.includes(a.id))
        ),
        searchBooks(searchName).then((r) =>
          (r.items ?? [])
            .map(normalizeGoogleBook)
            .filter((b) => {
              const title = b.title?.toLowerCase() ?? '';
              const searchSq = searchName.toLowerCase();
              const words = searchSq.split(' ').filter((w) => w.length > 3);
              return title.includes(sq) || title.includes(searchSq) || words.every((word) => title.includes(word));
            })
        ),
        Promise.all([
          searchGamesForSaga(searchName),
          sq.includes('harry') || sq.includes('potter')
            ? searchGamesForSaga('hogwarts')
            : Promise.resolve({ results: [] }),
        ]).then(([r1, r2]) => {
          const hogwartsAliases = ['hogwarts', 'harry potter', 'wizarding'];
          
          const r1Results = (r1.results ?? []).map(normalizeRawgGame);
          const r2Results = (r2.results ?? []).map(normalizeRawgGame).filter((g) =>
            hogwartsAliases.some((alias) => g.title.toLowerCase().includes(alias))
          );

          return [...r1Results, ...r2Results]
            .filter((g, i, arr) => arr.findIndex((x) => x.id === g.id) === i)
            .filter((g) => {
              const title = g.title.toLowerCase();
              const searchSq = searchName.toLowerCase();
              const isRelevant = title.includes(sq) || title.includes(searchSq) ||  hogwartsAliases.some((alias) => title.includes(alias));
              return g.poster && isRelevant && !excluded.some((e) => title.includes(e));
            })
            .sort((a, b) => parseFloat(b.rating ?? '0') - parseFloat(a.rating ?? '0'));
        }),
        searchMusicReleaseGroups(searchName).then((r) => {
          const searchSq = searchName.toLowerCase();
          return (r['release-groups'] ?? [])
            .map(normalizeMusicBrainzRelease)
            .filter((a) => {
              const title = a.title?.toLowerCase() ?? '';
              return title.includes(sq) || title.includes(searchSq);
            });
        }),
      ]);

      const minRating = 6;
      const filterAndSort = (arr, isMusic = false, isBook = false) => {
        const filtered = arr
          .filter((o) => isMusic || isBook || o.poster)
          .filter((o) => isMusic || isBook || (o.rating !== '—' && parseFloat(o.rating) >= minRating && parseFloat(o.rating) < 9.5))
          .filter((o) => !o.year || o.year === '—' || parseInt(o.year) >= 1970)
          .filter((o) => o.source !== 'tmdb' || (o.voteCount ?? 0) >= 50);
        return filtered.sort((a, b) => (b.year ?? '0').localeCompare(a.year ?? '0'));
      };

      return {
        movies: movies.status === 'fulfilled' ? filterAndSort(movies.value) : [],
        series: series.status === 'fulfilled' ? filterAndSort(series.value) : [],
        anime:  anime.status  === 'fulfilled' ? filterAndSort(anime.value)  : [],
        books:  books.status  === 'fulfilled' ? filterAndSort(books.value, false, true) : [],
        games:  games.status  === 'fulfilled' ? filterAndSort(games.value)  : [],
        music:  music.status  === 'fulfilled' ? filterAndSort(music.value, true) : [],
      };
    },

    enabled:   Boolean(sagaName?.trim()),
    staleTime: 0,
  });

  return { grouped: data ?? {}, isLoading, error };
}
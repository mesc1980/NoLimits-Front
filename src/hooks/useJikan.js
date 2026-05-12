/**
 * hooks/useJikan.js
 * Custom hooks para consumir la API de Jikan (MAL) con TanStack Query.
 * Expone: useTopAnime, useSeasonAnime, useAnimeDetail
 *
 * Jikan tiene rate limiting (~3 req/s). TanStack Query evita duplicados
 * y mantiene los datos en caché para minimizar llamadas.
 *
 * Depende de: services/jikan.js · utils/normalizeMedia.js
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchTopAnime,
  fetchSeasonNowAnime,
  fetchAnimeDetail,
} from '@/services/jikan';
import { normalizeJikanAnime } from '@/utils/normalizeMedia';

/* 10 minutos — respeta el rate limiting de Jikan */
const STALE_TIME = 10 * 60 * 1000;

/**
 * Top animes por score en MyAnimeList.
 * @returns {{ data: Obra[], isLoading: boolean, error: Error|null }}
 */
export function useTopAnime() {
  return useQuery({
    queryKey: ['jikan', 'top-anime'],
    queryFn: async () => {
      const res = await fetchTopAnime();
      return res.data.map(normalizeJikanAnime);
    },
    staleTime: STALE_TIME,
  });
}

/**
 * Animes de la temporada actual (season now).
 */
export function useSeasonAnime() {
  return useQuery({
    queryKey: ['jikan', 'season-now'],
    queryFn: async () => {
      const res = await fetchSeasonNowAnime();
      return res.data.map(normalizeJikanAnime);
    },
    staleTime: STALE_TIME,
  });
}

/**
 * Detalle de un anime por MAL ID.
 * @param {string|number|null} malId
 */
export function useAnimeDetail(malId) {
  return useQuery({
    queryKey: ['jikan', 'anime', malId],
    queryFn: async () => {
      const res = await fetchAnimeDetail(malId);
      /* /anime/:id/full devuelve { data: { ... } } */
      return normalizeJikanAnime(res.data);
    },
    enabled:   Boolean(malId),
    staleTime: STALE_TIME,
  });
}

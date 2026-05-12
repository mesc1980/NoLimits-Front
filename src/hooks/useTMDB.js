/**
 * hooks/useTMDB.js
 * Custom hooks para consumir TMDB a través de TanStack Query.
 * Cada hook expone: { data, isLoading, error, isFetching }
 *
 * Depende de: services/tmdb.js · utils/normalizeMedia.js
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchTrendingMovies,
  fetchTrendingSeries,
  fetchTopRatedMovies,
  fetchMovieDetail,
  fetchSeriesDetail,
} from '@/services/tmdb';
import {
  normalizeTmdbMovie,
  normalizeTmdbSeries,
} from '@/utils/normalizeMedia';

/* Datos de tendencia se refrescan cada 5 minutos */
const STALE_TIME_TRENDING = 5 * 60 * 1000;
/* Detalles de obra son más estables: 15 minutos */
const STALE_TIME_DETAIL = 15 * 60 * 1000;

/* ============================================================
   TRENDING
============================================================ */

/**
 * Películas en tendencia de la semana.
 * @returns {{ data: Obra[], isLoading: boolean, error: Error|null }}
 */
export function useTrendingMovies() {
  return useQuery({
    queryKey: ['tmdb', 'trending', 'movies'],
    queryFn: async () => {
      const res = await fetchTrendingMovies();
      return res.results.map(normalizeTmdbMovie);
    },
    staleTime: STALE_TIME_TRENDING,
  });
}

/**
 * Series en tendencia de la semana.
 */
export function useTrendingSeries() {
  return useQuery({
    queryKey: ['tmdb', 'trending', 'series'],
    queryFn: async () => {
      const res = await fetchTrendingSeries();
      return res.results.map(normalizeTmdbSeries);
    },
    staleTime: STALE_TIME_TRENDING,
  });
}

/* ============================================================
   TOP RATED
============================================================ */

/**
 * Películas mejor valoradas de todos los tiempos.
 */
export function useTopRatedMovies() {
  return useQuery({
    queryKey: ['tmdb', 'top-rated', 'movies'],
    queryFn: async () => {
      const res = await fetchTopRatedMovies();
      return res.results.map(normalizeTmdbMovie);
    },
    staleTime: STALE_TIME_TRENDING,
  });
}

/* ============================================================
   DETALLE
============================================================ */

/**
 * Detalle completo de una película por ID nativo de TMDB.
 * La query se habilita solo cuando `id` es un valor truthy.
 * @param {string|number|null} id
 */
export function useMovieDetail(id) {
  return useQuery({
    queryKey: ['tmdb', 'movie', id],
    queryFn: async () => {
      const res = await fetchMovieDetail(id);
      return normalizeTmdbMovie(res);
    },
    enabled:   Boolean(id),
    staleTime: STALE_TIME_DETAIL,
  });
}

/**
 * Detalle completo de una serie.
 * @param {string|number|null} id
 */
export function useSeriesDetail(id) {
  return useQuery({
    queryKey: ['tmdb', 'series', id],
    queryFn: async () => {
      const res = await fetchSeriesDetail(id);
      return normalizeTmdbSeries(res);
    },
    enabled:   Boolean(id),
    staleTime: STALE_TIME_DETAIL,
  });
}

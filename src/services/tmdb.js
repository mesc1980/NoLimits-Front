/**
 * services/tmdb.js
 * Funciones de acceso a la API de TMDB v3.
 * Documentación: https://developer.themoviedb.org/docs
 *
 * API key en variable de entorno: VITE_TMDB_KEY
 * Migración a backend: reemplazar tmdbUrl() por apiFetch(backendUrl) cuando exista.
 */

import { apiFetch } from './api';
import { TMDB_BASE_URL } from '@/utils/constants';

/* Clave de TMDB inyectada por Vite desde .env */
const KEY = import.meta.env.VITE_TMDB_KEY;

/**
 * Construye la URL completa de TMDB con la API key y parámetros opcionales.
 * @param {string} path      - Ruta relativa, ej: "/trending/movie/week"
 * @param {Object} params    - Query params adicionales
 * @returns {string}         - URL lista para fetch
 */
function tmdbUrl(path, params = {}) {
  const query = new URLSearchParams({
    api_key:  KEY,
    language: 'es-ES',
    ...params,
  });
  return `${TMDB_BASE_URL}${path}?${query}`;
}

/* ============================================================
   TRENDING
============================================================ */

/** Películas en tendencia de la semana. */
export async function fetchTrendingMovies() {
  return apiFetch(tmdbUrl('/trending/movie/week'));
}

/** Series en tendencia de la semana. */
export async function fetchTrendingSeries() {
  return apiFetch(tmdbUrl('/trending/tv/week'));
}

/* ============================================================
   TOP RATED
============================================================ */

/** Películas mejor valoradas de todos los tiempos. */
export async function fetchTopRatedMovies() {
  return apiFetch(tmdbUrl('/movie/top_rated'));
}

/** Series mejor valoradas. */
export async function fetchTopRatedSeries() {
  return apiFetch(tmdbUrl('/tv/top_rated'));
}

/* ============================================================
   BÚSQUEDA
============================================================ */

/**
 * Busca películas por término de búsqueda.
 * @param {string} query
 * @param {number} page - Página (default 1)
 */
export async function searchMovies(query, page = 1) {
  return apiFetch(tmdbUrl('/search/movie', { query, page }));
}

/**
 * Busca series por término de búsqueda.
 * @param {string} query
 * @param {number} page
 */
export async function searchSeries(query, page = 1) {
  return apiFetch(tmdbUrl('/search/tv', { query, page }));
}

/* ============================================================
   DETALLE
============================================================ */

/**
 * Detalle completo de una película (incluye créditos y vídeos).
 * @param {number|string} id - ID nativo de TMDB
 */
export async function fetchMovieDetail(id) {
  return apiFetch(tmdbUrl(`/movie/${id}`, { append_to_response: 'credits,videos,belongs_to_collection' }));
}

/**
 * Detalle completo de una serie.
 * @param {number|string} id
 */
export async function fetchSeriesDetail(id) {
  return apiFetch(tmdbUrl(`/tv/${id}`, { append_to_response: 'credits,videos' }));
}

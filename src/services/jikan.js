/**
 * services/jikan.js
 * Funciones de acceso a la API de Jikan (MyAnimeList unofficial) v4.
 * Documentación: https://docs.api.jikan.moe/
 *
 * Sin API key. Jikan tiene rate limiting: ~3 req/s.
 * TanStack Query maneja el caché y evita requests duplicados.
 */

import { apiFetch } from './api';
import { JIKAN_BASE_URL } from '@/utils/constants';

/**
 * Construye la URL de Jikan con query params opcionales.
 * @param {string} path   - Ruta relativa, ej: "/top/anime"
 * @param {Object} params - Query params
 * @returns {string}
 */
function jikanUrl(path, params = {}) {
  const query = new URLSearchParams(params);
  const qs = query.toString();
  return `${JIKAN_BASE_URL}${path}${qs ? `?${qs}` : ''}`;
}

/* ============================================================
   TOP / TEMPORADA
============================================================ */

/**
 * Top animes por popularidad o score.
 * @param {number} page
 */
export async function fetchTopAnime(page = 1) {
  return apiFetch(jikanUrl('/top/anime', { page, limit: 20 }));
}

/**
 * Animes de la temporada actual.
 * Útil para la sección "Esta temporada" en el home.
 */
export async function fetchSeasonNowAnime() {
  return apiFetch(jikanUrl('/seasons/now', { limit: 20 }));
}

/* ============================================================
   BÚSQUEDA
============================================================ */

/**
 * Busca animes por término.
 * sfw:true filtra contenido adulto.
 * @param {string} query
 * @param {number} page
 */
export async function searchAnime(query, page = 1) {
  return apiFetch(jikanUrl('/anime', { q: query, page, limit: 40, sfw: true }));
}

/* ============================================================
   DETALLE
============================================================ */

/**
 * Detalle completo de un anime (/full incluye relaciones y personajes).
 * @param {number|string} malId - ID de MyAnimeList
 */
export async function fetchAnimeDetail(malId) {
  return apiFetch(jikanUrl(`/anime/${malId}/full`));
}

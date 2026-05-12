/**
 * services/whereToWatch.js
 * Obtiene los proveedores de streaming para películas y series vía TMDB.
 * Documentación: https://developer.themoviedb.org/reference/movie-watch-providers
 *
 * Retorna links directos a JustWatch para Argentina (AR) por defecto.
 */

import { apiFetch } from './api';
import { TMDB_BASE_URL, WATCH_PROVIDERS_COUNTRY } from '@/utils/constants';

const KEY = import.meta.env.VITE_TMDB_KEY;

function tmdbUrl(path, params = {}) {
  const query = new URLSearchParams({ api_key: KEY, ...params });
  return `${TMDB_BASE_URL}${path}?${query}`;
}

/**
 * Proveedores de streaming para una película.
 * @param {number|string} tmdbId   — ID numérico de TMDB
 * @param {string}        country  — Código ISO 3166-1, ej: 'AR', 'CL', 'US'
 * @returns {Object|null}           — { flatrate, rent, buy, link }
 */
export async function fetchMovieProviders(tmdbId, country = WATCH_PROVIDERS_COUNTRY) {
  const data = await apiFetch(tmdbUrl(`/movie/${tmdbId}/watch/providers`));
  return data.results?.[country] ?? null;
}

/**
 * Proveedores de streaming para una serie.
 */
export async function fetchSeriesProviders(tmdbId, country = WATCH_PROVIDERS_COUNTRY) {
  const data = await apiFetch(tmdbUrl(`/tv/${tmdbId}/watch/providers`));
  return data.results?.[country] ?? null;
}

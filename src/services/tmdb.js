/**
 * services/tmdb.js
 * Todas las llamadas van al backend, la API key nunca llega al browser.
 */

import { apiFetch } from './api';

const BACKEND = import.meta.env.VITE_API_BASE_URL;

export async function fetchTrendingMovies() {
  return apiFetch(`${BACKEND}/api/tmdb/trending/movie/week`);
}

export async function fetchTrendingSeries() {
  return apiFetch(`${BACKEND}/api/tmdb/trending/tv/week`);
}

export async function fetchTopRatedMovies() {
  return apiFetch(`${BACKEND}/api/tmdb/movie/top_rated`);
}

export async function fetchTopRatedSeries() {
  return apiFetch(`${BACKEND}/api/tmdb/tv/top_rated`);
}

export async function searchMovies(query, page = 1) {
  return apiFetch(`${BACKEND}/api/tmdb/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
}

export async function searchSeries(query, page = 1) {
  return apiFetch(`${BACKEND}/api/tmdb/search/tv?query=${encodeURIComponent(query)}&page=${page}`);
}

export async function fetchMovieDetail(id) {
  return apiFetch(`${BACKEND}/api/tmdb/movie/${id}?append_to_response=credits,videos,belongs_to_collection`);
}

export async function fetchSeriesDetail(id) {
  return apiFetch(`${BACKEND}/api/tmdb/tv/${id}?append_to_response=credits,videos`);
}
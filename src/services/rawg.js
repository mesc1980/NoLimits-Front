/**
 * services/rawg.js — RAWG Video Games Database
 * Todas las llamadas van al backend, la API key nunca llega al browser.
 */

import { apiFetch } from './api';

const BACKEND = import.meta.env.VITE_API_BASE_URL;

export const rawgEnabled = () => Boolean(BACKEND);

export async function fetchTopGames() {
  return apiFetch(`${BACKEND}/api/rawg/games?ordering=-rating&page_size=20&min_ratings=50&stores=1,2,3,5,6,11`);
}

export async function searchGames(query) {
  return apiFetch(`${BACKEND}/api/rawg/games?search=${encodeURIComponent(query)}&page_size=20&search_precise=true`);
}

export async function searchGamesForSaga(query) {
  return apiFetch(`${BACKEND}/api/rawg/games?search=${encodeURIComponent(query)}&page_size=40&stores=1,2,3,5,6,11&dates=2013-01-01,2026-12-31&search_precise=true`);
}

export async function fetchGameDetail(id) {
  return apiFetch(`${BACKEND}/api/rawg/games/${id}`);
}

export async function fetchGameStores(id) {
  return apiFetch(`${BACKEND}/api/rawg/games/${id}/stores`);
}
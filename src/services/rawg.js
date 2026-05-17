/**
 * services/rawg.js — RAWG Video Games Database
 * Documentación: https://rawg.io/apidocs
 */

const API_KEY = import.meta.env.VITE_RAWG_KEY;
const BASE    = 'https://api.rawg.io/api';

export const rawgEnabled = () => Boolean(API_KEY);

async function rawgFetch(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`RAWG error ${res.status}`);
  return res.json();
}

export async function fetchTopGames() {
  return rawgFetch('/games', { 
    ordering: '-rating', 
    page_size: 20, 
    min_ratings: 50,
    stores: '1,2,3,5,6,11',
  });
}

// Búsqueda general — sin filtro de stores para máxima cobertura
export async function searchGames(query) {
  return rawgFetch('/games', { 
    search: query, 
    page_size: 20,
    search_precise: true,
  });
}

// Búsqueda para sagas — con filtro de stores y fecha
export async function searchGamesForSaga(query) {
  return rawgFetch('/games', { 
    search: query, 
    page_size: 40,
    stores: '1,2,3,5,6,11',
    dates: '2013-01-01,2026-12-31',
    search_precise: true,
  });
}

export async function fetchGameDetail(id) {
  return rawgFetch(`/games/${id}`);
}

export async function fetchGameStores(id) {
  return rawgFetch(`/games/${id}/stores`);
}
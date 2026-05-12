/**
 * services/igdb.js
 * Funciones de acceso a la API de IGDB (Internet Games Database).
 * Documentación: https://api-docs.igdb.com/
 *
 * En desarrollo: las requests van a /api/igdb/* → proxy de Vite → api.igdb.com
 *   El proxy en vite.config.js inyecta Client-ID y Authorization.
 *
 * En producción: apuntar VITE_API_BASE_URL al backend que expone /api/igdb/*
 *   con las credenciales guardadas de forma segura server-side.
 *
 * Lenguaje de query: Apicalypse (texto plano en el body del POST).
 * Referencia: https://apicalypse.io/
 */

import { apiFetch } from './api';

/* En prod el backend absorbe la ruta; en dev el proxy de Vite la intercepta */
const BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/igdb`
  : '/api/igdb';

/**
 * Ejecuta una query Apicalypse contra un endpoint de IGDB.
 * @param {string} endpoint — Ej: '/games', '/game_series'
 * @param {string} query    — Query en lenguaje Apicalypse
 */
async function igdbQuery(endpoint, query) {
  return apiFetch(`${BASE}${endpoint}`, {
    method:  'POST',
    body:    query,
    headers: { 'Content-Type': 'text/plain' },
  });
}

/* ── Imágenes ─────────────────────────────────────────────── */

/**
 * Convierte la URL de imagen de IGDB a una versión de mayor tamaño.
 * Entrada:  "//images.igdb.com/igdb/image/upload/t_thumb/co1wyy.jpg"
 * Salida:   "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg"
 *
 * @param {string|undefined} url
 * @param {'t_thumb'|'t_cover_big'|'t_720p'|'t_1080p'} size
 */
export function igdbImageUrl(url, size = 't_cover_big') {
  if (!url) return null;
  return `https:${url}`.replace('t_thumb', size);
}

/* ── Queries ──────────────────────────────────────────────── */

/**
 * Top juegos por rating (populares y bien valorados).
 * rating_count > 20 filtra juegos sin suficientes votos.
 */
export async function fetchTopGames() {
  return igdbQuery('/games', `
    fields name, cover.url, rating, first_release_date,
           genres.name, platforms.name, summary, involved_companies.company.name;
    where rating != null & rating_count > 20 & cover != null;
    sort rating desc;
    limit 20;
  `);
}

/**
 * Busca juegos por nombre.
 * @param {string} query
 */
export async function searchGames(query) {
  return igdbQuery('/games', `
    fields name, cover.url, rating, first_release_date,
           genres.name, platforms.name, summary;
    search "${query.replace(/"/g, '')}";
    where cover != null;
    limit 20;
  `);
}

/**
 * Busca franquicias/colecciones de juegos por nombre.
 * Útil para la página de Saga.
 * @param {string} sagaName
 */
export async function searchGameSeries(sagaName) {
  return igdbQuery('/collections', `
    fields name, games.name, games.cover.url, games.rating,
           games.first_release_date, games.platforms.name, games.summary;
    search "${sagaName.replace(/"/g, '')}";
    limit 5;
  `);
}

/**
 * Detalle completo de un juego por ID de IGDB.
 * @param {number|string} id
 */
export async function fetchGameDetail(id) {
  const results = await igdbQuery('/games', `
    fields name, cover.url, rating, first_release_date,
           genres.name, platforms.name, summary,
           involved_companies.company.name, screenshots.url,
           similar_games.name, collection.name, franchise.name;
    where id = ${id};
    limit 1;
  `);
  return results?.[0] ?? null;
}

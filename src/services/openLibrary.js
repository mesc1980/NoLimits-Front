/**
 * services/openLibrary.js
 * Funciones de acceso a la API de Open Library.
 * Documentación: https://openlibrary.org/developers/api
 *
 * Sin API key. Completamente pública y gratuita.
 */

import { apiFetch } from './api';
import { OPENLIBRARY_BASE_URL } from '@/utils/constants';

/* ============================================================
   BÚSQUEDA
============================================================ */

/**
 * Busca libros por término de búsqueda en Open Library.
 * El campo `fields` limita la respuesta para reducir payload.
 * @param {string} query
 * @param {number} page
 */
export async function searchBooks(query, page = 1) {
  const params = new URLSearchParams({
    q:      query,
    page,
    limit:  40,
    fields: [
      'key', 'title', 'author_name', 'first_publish_year',
      'cover_i', 'ratings_average', 'subject',
      'first_sentence', 'edition_key',
    ].join(','),
  });
  return apiFetch(`${OPENLIBRARY_BASE_URL}/search.json?${params}`);
}

/* ============================================================
   CATÁLOGO POR TEMA
============================================================ */

/**
 * Obtiene obras destacadas por tema (science_fiction, fantasy, etc.).
 * Usado en la sección "Libros recomendados" del home.
 * @param {string} subject - Ej: "science_fiction"
 */
export async function fetchBooksBySubject(subject = 'science_fiction') {
  const params = new URLSearchParams({ limit: 20 });

  const response = await fetch(
    `${OPENLIBRARY_BASE_URL}/subjects/${subject}.json?${params}`
  );

  if (!response.ok) {
    throw new Error('No se pudieron cargar los libros');
  }

  return response.json();
}

/* ============================================================
   DETALLE
============================================================ */

/**
 * Detalle completo de una obra por su key de Open Library.
 * @param {string} workKey - Ej: "/works/OL45804W"
 */
export async function fetchBookDetail(workKey) {
  const response = await fetch(
    `${OPENLIBRARY_BASE_URL}${workKey}.json`
  );

  if (!response.ok) {
    throw new Error('No se pudo cargar el detalle del libro');
  }

  return response.json();
}
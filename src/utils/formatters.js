/**
 * utils/formatters.js
 * Funciones puras de formateo: ratings, fechas, duraciones, URLs de imagen.
 */

import { TMDB_IMAGE_BASE, OPENLIBRARY_COVERS } from './constants';

export function formatRating(rating) {
  const num = parseFloat(rating);
  if (isNaN(num) || num === 0) return '—';
  return num.toFixed(1);
}

export function formatYear(date) {
  if (!date) return '—';
  if (typeof date === 'number') return String(date);
  const year = String(date).slice(0, 4);
  return /^\d{4}$/.test(year) ? year : '—';
}

export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function truncateText(text, max = 150) {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

export function formatGenres(genres, limit = 3) {
  if (!Array.isArray(genres) || genres.length === 0) return '—';
  return genres.slice(0, limit).join(' · ');
}

export function buildTmdbImageUrl(path, size = 'w342') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function buildOpenLibraryCoverUrl(coverId, size = 'M') {
  if (!coverId) return null;
  return `${OPENLIBRARY_COVERS}/b/id/${coverId}-${size}.jpg`;
}

/**
 * Genera el ID compuesto "source:type:nativeId".
 * Incluir el tipo es esencial para que Detail.jsx sepa qué hook usar.
 * @param {string} source   — 'tmdb' | 'jikan' | 'openlibrary' | 'rawg' | 'musicbrainz'
 * @param {string|number} nativeId
 * @param {string} type     — MEDIA_TYPES.* (movie | series | anime | book | game | music)
 */
export function buildMediaId(source, nativeId, type) {
  return `${source}:${type}:${nativeId}`;
}

/**
 * Convierte ID compuesto a slug URL-safe reemplazando ":" por "-".
 * "tmdb:movie:12345" → "tmdb-movie-12345"
 */
export function mediaIdToSlug(mediaId) {
  if (!mediaId) return '';
  return mediaId.replace(/:/g, '-');
}

/**
 * Convierte slug de vuelta a ID compuesto.
 * "tmdb-movie-12345" → { source: 'tmdb', type: 'movie', nativeId: '12345' }
 * "openlibrary-book-OL45804W" → { source: 'openlibrary', type: 'book', nativeId: 'OL45804W' }
 */
export function parseMediaSlug(slug) {
  if (!slug) return { source: '', type: '', nativeId: '' };

  // Productos propios de NoLimits: "nolimits-10"
  if (slug.startsWith('nolimits-')) {
    return {
      source: 'nolimits',
      type: 'producto',
      nativeId: slug.replace('nolimits-', ''),
    };
  }

  const idx1 = slug.indexOf('-');
  const idx2 = slug.indexOf('-', idx1 + 1);

  if (idx1 === -1 || idx2 === -1) {
    return { source: slug, type: '', nativeId: '' };
  }

  return {
    source: slug.slice(0, idx1),
    type: slug.slice(idx1 + 1, idx2),
    nativeId: slug.slice(idx2 + 1),
  };
}
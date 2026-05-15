/**
 * utils/normalizeMedia.js — Normalizadores de APIs externas al modelo Obra
 * ══════════════════════════════════════════════════════════════════════════
 *
 * PROPÓSITO:
 * Cada API externa retorna estructuras distintas. Este archivo las convierte
 * todas al modelo unificado `Obra`, permitiendo que hooks y componentes
 * trabajen con un único tipo de dato sin importar la fuente.
 *
 * MODELO OBRA:
 * ┌─────────────┬──────────────────────────────────────────────────────┐
 * │ Campo       │ Descripción                                          │
 * ├─────────────┼──────────────────────────────────────────────────────┤
 * │ id          │ "source:type:nativeId" — ej: "tmdb:movie:12345"     │
 * │ type        │ MEDIA_TYPES.* — movie|series|anime|book|music|game  │
 * │ title       │ Título en español si disponible                      │
 * │ year        │ Año de lanzamiento como string ("2022") o "—"        │
 * │ rating      │ 0-10 normalizado como string ("8.7") o "—"           │
 * │ poster      │ URL de imagen portrait (2:3) o null                  │
 * │ backdrop    │ URL de imagen landscape (16:9) o null                │
 * │ synopsis    │ Descripción/sinopsis en texto plano                  │
 * │ genres      │ string[] — ["Acción", "Aventura"]                   │
 * │ saga        │ Nombre de la colección/franquicia o null             │
 * │ platforms   │ string[] — Redes de TV, estudios, tiendas           │
 * │ source      │ DATA_SOURCES.* — de dónde vino el dato              │
 * └─────────────┴──────────────────────────────────────────────────────┘
 *
 * INTEGRACIÓN DEL BACKEND:
 * Cuando el backend devuelva obras ya normalizadas, NO se necesitarán
 * estos normalizadores en el cliente. El backend los reutilizará internamente
 * y retornará directamente Obra[]. Los hooks y componentes no cambiarán.
 *
 * @module utils/normalizeMedia
 */

import { MEDIA_TYPES, DATA_SOURCES, TMDB_POSTER_SIZES, TMDB_BACKDROP_SIZES } from './constants';
import {
  buildTmdbImageUrl,
  buildOpenLibraryCoverUrl,
  buildMediaId,
  formatYear,
  formatRating,
} from './formatters';
import { igdbImageUrl } from '@/services/igdb';

const FALLBACK_IMAGES = {
  video: '/img/fallbacks/movie-tvshow-fallback.webp',
  book: '/img/fallbacks/book-fallback.webp',
  game: '/img/fallbacks/videogame-fallback.webp',
  music: '/img/fallbacks/music-fallback.webp',
};

// ─────────────────────────────────────────────────────────────────
// TMDB — Películas
// Referencia: https://developer.themoviedb.org/reference/movie-details
// ─────────────────────────────────────────────────────────────────
export function normalizeTmdbMovie(item) {
  return {
    id:        buildMediaId(DATA_SOURCES.TMDB, item.id, MEDIA_TYPES.MOVIE),
    type:      MEDIA_TYPES.MOVIE,
    title:     item.title || item.original_title || 'Sin título',
    year:      formatYear(item.release_date),
    rating:    formatRating(item.vote_average),
    poster:
      buildTmdbImageUrl(item.poster_path, TMDB_POSTER_SIZES.MD)
      || FALLBACK_IMAGES.video,

    backdrop:
      buildTmdbImageUrl(item.backdrop_path, TMDB_BACKDROP_SIZES.LG)
      || FALLBACK_IMAGES.video,
    synopsis:  item.overview || '',
    genres:    item.genres?.map((g) => g.name) ?? item.genre_ids?.map(String) ?? [],
    // belongs_to_collection solo disponible en el endpoint de detalle, no en listados
    saga:      item.belongs_to_collection?.name ?? null,
    platforms: [],
    source:    DATA_SOURCES.TMDB,
  };
}

// ─────────────────────────────────────────────────────────────────
// TMDB — Series de TV
// ─────────────────────────────────────────────────────────────────
export function normalizeTmdbSeries(item) {
  return {
    id:        buildMediaId(DATA_SOURCES.TMDB, item.id, MEDIA_TYPES.SERIES),
    type:      MEDIA_TYPES.SERIES,
    title:     item.name || item.original_name || 'Sin título',
    year:      formatYear(item.first_air_date),
    rating:    formatRating(item.vote_average),
    poster:
      buildTmdbImageUrl(item.poster_path, TMDB_POSTER_SIZES.MD)
      || FALLBACK_IMAGES.video,

    backdrop:
      buildTmdbImageUrl(item.backdrop_path, TMDB_BACKDROP_SIZES.LG)
      || FALLBACK_IMAGES.video,
    synopsis:  item.overview || '',
    genres:    item.genres?.map((g) => g.name) ?? item.genre_ids?.map(String) ?? [],
    saga:      null,
    // networks = cadenas de TV (Netflix, HBO…), útil para saber dónde ver
    platforms: item.networks?.map((n) => n.name) ?? [],
    source:    DATA_SOURCES.TMDB,
  };
}

// ─────────────────────────────────────────────────────────────────
// Jikan v4 — Anime
// Referencia: https://docs.api.jikan.moe/
// ─────────────────────────────────────────────────────────────────
export function normalizeJikanAnime(item) {
  return {
    id:        buildMediaId(DATA_SOURCES.JIKAN, item.mal_id, MEDIA_TYPES.ANIME),
    type:      MEDIA_TYPES.ANIME,
    // Preferir título en inglés para consistencia con la búsqueda
    title:     item.title_english || item.title || 'Sin título',
    year:      item.year ? String(item.year) : formatYear(item.aired?.from),
    // Jikan devuelve rating /10, igual que TMDB — ya es compatible
    rating:    formatRating(item.score),
    poster:
      item.images?.jpg?.large_image_url ??
      item.images?.jpg?.image_url ??
      FALLBACK_IMAGES.video,

    backdrop:
      item.trailer?.images?.maximum_image_url ??
      item.images?.jpg?.large_image_url ??
      FALLBACK_IMAGES.video,
    synopsis:  item.synopsis || '',
    genres:    item.genres?.map((g) => g.name) ?? [],
    saga:      null,
    // studios = estudios de animación (Trigger, Mappa, etc.)
    platforms: item.studios?.map((s) => s.name) ?? [],
    source:    DATA_SOURCES.JIKAN,
  };
}

// ─────────────────────────────────────────────────────────────────
// Open Library — Libros (endpoint /search.json)
// Referencia: https://openlibrary.org/developers/api
// ─────────────────────────────────────────────────────────────────
export function normalizeOpenLibraryBook(item) {
  const nativeId = item.key?.replace('/works/', '')
    ?? item.edition_key?.[0]
    ?? String(item.cover_i ?? item.covers?.[0] ?? Math.random());

  const coverId = item.cover_i ?? item.covers?.[0] ?? item.cover_id;

  return {
    id:        buildMediaId(DATA_SOURCES.OPENLIBRARY, nativeId, MEDIA_TYPES.BOOK),
    type:      MEDIA_TYPES.BOOK,
    title:     item.title || 'Sin título',
    year:      String(item.first_publish_year || item.first_publish_date || '—'),
    rating:    formatRating(item.ratings_average),
    poster:
      buildOpenLibraryCoverUrl(coverId, 'L')
      || FALLBACK_IMAGES.book,

    backdrop:
      buildOpenLibraryCoverUrl(coverId, 'L')
      || FALLBACK_IMAGES.book,
    synopsis:  typeof item.description === 'object'
                 ? item.description.value
                 : item.description
                   || (typeof item.first_sentence === 'object'
                     ? item.first_sentence.value
                     : item.first_sentence || ''),
    genres:    Array.isArray(item.subjects)
                 ? item.subjects.slice(0, 5)
                 : Array.isArray(item.subject)
                   ? item.subject.slice(0, 5)
                   : [],
    saga:      null,
    platforms: [],
    source:    DATA_SOURCES.OPENLIBRARY,
  };
}

// Variante para el endpoint /subjects/:subject.json (estructura diferente)
export function normalizeOpenLibrarySubjectWork(item) {
  const key     = item.key?.replace('/works/', '') ?? String(Math.random());
  const coverId = item.cover_id ?? item.cover_edition_key;
  return {
    id:        buildMediaId(DATA_SOURCES.OPENLIBRARY, key, MEDIA_TYPES.BOOK),
    type:      MEDIA_TYPES.BOOK,
    title:     item.title || 'Sin título',
    year:      '—',
    rating:    '—',
    poster:
      buildOpenLibraryCoverUrl(coverId, 'M')
      || FALLBACK_IMAGES.book,

    backdrop:
      buildOpenLibraryCoverUrl(coverId, 'L')
      || FALLBACK_IMAGES.book,
    synopsis:  '',
    genres:    item.subject?.slice(0, 5) ?? [],
    saga:      null,
    platforms: [],
    source:    DATA_SOURCES.OPENLIBRARY,
  };
}

// ─────────────────────────────────────────────────────────────────
// IGDB — Videojuegos
// Referencia: https://api-docs.igdb.com/
// IGDB rating va de 0 a 100 — se divide por 10 para normalizar a /10
// ─────────────────────────────────────────────────────────────────
function igdbYear(timestamp) {
  if (!timestamp) return '—';
  return String(new Date(timestamp * 1000).getFullYear());
}

export function normalizeIgdbGame(item) {
  return {
    id:        buildMediaId(DATA_SOURCES.IGDB, item.id, MEDIA_TYPES.GAME),
    type:      MEDIA_TYPES.GAME,
    title:     item.name || 'Sin título',
    year:      igdbYear(item.first_release_date),
    // IGDB usa escala 0-100 → dividir por 10 para consistencia con el resto
    rating:    item.rating ? formatRating(item.rating / 10) : '—',
    // t_cover_big = 264×374px (portrait ~2:3) — compatible con el grid de cards
    poster:
      igdbImageUrl(item.cover?.url, 't_cover_big')
      || FALLBACK_IMAGES.game,

    backdrop:
      igdbImageUrl(item.screenshots?.[0]?.url, 't_720p')
      || FALLBACK_IMAGES.game,
    synopsis:  item.summary || '',
    genres:    item.genres?.map((g) => g.name) ?? [],
    // collection/franchise = nombre de la saga (Spider-Man, Zelda, etc.)
    saga:      item.collection?.name ?? item.franchise?.name ?? null,
    platforms: item.platforms?.map((p) => p.name) ?? [],
    source:    DATA_SOURCES.IGDB,
  };
}

// ─────────────────────────────────────────────────────────────────
// MusicBrainz — Música y soundtracks
// Referencia: https://musicbrainz.org/doc/MusicBrainz_API
// MusicBrainz rating va de 0 a 5 — se multiplica por 2 para llevar a /10
// ─────────────────────────────────────────────────────────────────
export function normalizeMusicBrainzRelease(item) {
  return {
    id:        buildMediaId(DATA_SOURCES.MUSICBRAINZ, item.id, MEDIA_TYPES.MUSIC),
    type:      MEDIA_TYPES.MUSIC,
    title:     item.title || item.name || item['artist-credit']?.[0]?.artist?.name || 'Sin título',
    year:      formatYear(item['first-release-date'] || item.date),
    rating:    item.rating?.value ? formatRating(item.rating.value * 2) : '—',

    poster:    '/img/fallbacks/music-fallback.webp',
    backdrop:  '/img/fallbacks/music-fallback.webp',

    synopsis:  item.disambiguation || item['primary-type'] || '',
    genres:    item.tags?.slice(0, 5).map((t) => t.name) ?? [],
    saga:      null,
    platforms: [],
    source:    DATA_SOURCES.MUSICBRAINZ,
  };
}
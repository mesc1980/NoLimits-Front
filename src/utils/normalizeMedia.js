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
    voteCount: item.vote_count ?? 0,
    poster:    buildTmdbImageUrl(item.poster_path,   TMDB_POSTER_SIZES.MD),
    backdrop:  buildTmdbImageUrl(item.backdrop_path, TMDB_BACKDROP_SIZES.LG),
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
    voteCount: item.vote_count ?? 0,
    poster:    buildTmdbImageUrl(item.poster_path,   TMDB_POSTER_SIZES.MD),
    backdrop:  buildTmdbImageUrl(item.backdrop_path, TMDB_BACKDROP_SIZES.LG),
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
    poster:    item.images?.jpg?.large_image_url ?? item.images?.jpg?.image_url ?? null,
    backdrop:  item.trailer?.images?.maximum_image_url ?? null,
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
  // El ID de Open Library viene como "/works/OL45804W" — extraemos el código
  const nativeId = item.key?.replace('/works/', '')
    ?? item.edition_key?.[0]
    ?? String(item.cover_i ?? Math.random());

  return {
    id:        buildMediaId(DATA_SOURCES.OPENLIBRARY, nativeId, MEDIA_TYPES.BOOK),
    type:      MEDIA_TYPES.BOOK,
    title:     item.title || 'Sin título',
    year:      String(item.first_publish_year || '—'),
    // ratings_average viene en escala /5 en algunos endpoints — Open Library es inconsistente
    rating:    formatRating(item.ratings_average),
    poster:    buildOpenLibraryCoverUrl(item.cover_i, 'M'),
    backdrop:  buildOpenLibraryCoverUrl(item.cover_i, 'L'),
    synopsis:  typeof item.first_sentence === 'object'
                 ? item.first_sentence.value
                 : item.first_sentence || '',
    genres:    Array.isArray(item.subject) ? item.subject.slice(0, 5) : [],
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
    poster:    buildOpenLibraryCoverUrl(coverId, 'M'),
    backdrop:  buildOpenLibraryCoverUrl(coverId, 'L'),
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
  const STORE_URL_PATTERNS = [
    { pattern: 'store.steampowered.com',  label: 'Steam',         accent: true  },
    { pattern: 'epicgames.com',           label: 'Epic Games',    accent: true  },
    { pattern: 'gog.com',                 label: 'GOG',           accent: true  },
    { pattern: 'store.playstation.com',   label: 'PlayStation',   accent: true  },
    { pattern: 'xbox.com',               label: 'Xbox',           accent: true  },
    { pattern: 'nintendo.com',           label: 'Nintendo',       accent: true  },
  ];

  const gameStores = (item.websites ?? [])
    .map((w) => {
      const match = STORE_URL_PATTERNS.find((p) => w.url?.includes(p.pattern));
      if (!match) return null;
      return { label: match.label, url: w.url, accent: match.accent };
    })
    .filter(Boolean);
  return {
    id:        buildMediaId(DATA_SOURCES.IGDB, item.id, MEDIA_TYPES.GAME),
    type:      MEDIA_TYPES.GAME,
    title:     item.name || 'Sin título',
    year:      igdbYear(item.first_release_date),
    // IGDB usa escala 0-100 → dividir por 10 para consistencia con el resto
    rating:    item.rating ? formatRating(item.rating / 10) : '—',
    // t_cover_big = 264×374px (portrait ~2:3) — compatible con el grid de cards
    poster:    igdbImageUrl(item.cover?.url, 't_cover_big'),
    backdrop:  igdbImageUrl(item.screenshots?.[0]?.url, 't_720p'),
    synopsis:  item.summary || '',
    genres:    item.genres?.map((g) => g.name) ?? [],
    // collection/franchise = nombre de la saga (Spider-Man, Zelda, etc.)
    saga:      item.collection?.name ?? item.franchise?.name ?? null,
    platforms: item.platforms?.map((p) => p.name) ?? [],
    gameStores: gameStores,
    source:    DATA_SOURCES.IGDB,
  };
}

// ─────────────────────────────────────────────────────────────────
// RAWG — Videojuegos
// Referencia: https://rawg.io/apidocs
// ─────────────────────────────────────────────────────────────────
export function normalizeRawgGame(item) {
  const STORE_URL_PATTERNS = [
    { pattern: 'store.steampowered.com', label: 'Steam',          accent: true  },
    { pattern: 'epicgames.com',          label: 'Epic Games',     accent: true  },
    { pattern: 'gog.com',               label: 'GOG',             accent: true  },
    { pattern: 'store.playstation.com', label: 'PlayStation',     accent: true  },
    { pattern: 'xbox.com',              label: 'Xbox',            accent: true  },
    { pattern: 'nintendo.com',          label: 'Nintendo eShop',  accent: true  },
  ];

  // Intentar primero con stores reales de RAWG
  const gameStores = (item.stores ?? [])
    .map((s) => {
      const url = s.url ?? s.store?.domain ?? '';
      if (!url || !url.startsWith('http')) return null;
      const match = STORE_URL_PATTERNS.find((p) => url.includes(p.pattern));
      if (!match) return null;
      return { label: match.label, url, accent: match.accent };
    })
    .filter(Boolean);

  // Si no hay stores, generar links por plataforma
  const platforms = (item.platforms ?? []).map((p) => p.platform?.name ?? p.name ?? '');

  return {
    id:         buildMediaId(DATA_SOURCES.RAWG ?? 'rawg', item.id, MEDIA_TYPES.GAME),
    type:       MEDIA_TYPES.GAME,
    title:      item.name || 'Sin título',
    year:       formatYear(item.released),
    rating:     item.rating ? formatRating(item.rating * 2) : '—', // RAWG es /5 → *2 para /10
    poster:     item.background_image ?? null,
    backdrop:   item.background_image_additional ?? item.background_image ?? null,
    synopsis:   item.description_raw || item.description || '',
    genres:     (item.genres ?? []).map((g) => g.name),
    saga:       null,
    platforms,
    gameStores,
    source:     'rawg',
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
    title:     item.title || 'Sin título',
    year:      formatYear(item['first-release-date'] || item.date),
    // rating.value en MusicBrainz = promedio de votos (0-5) → *2 para normalizar
    rating:    item.rating?.value ? formatRating(item.rating.value * 2) : '—',
    // MusicBrainz no provee imágenes directamente — el backend puede complementar
    // con la Cover Art Archive: https://coverartarchive.org/release-group/{mbid}
    poster:    null,
    backdrop:  null,
    synopsis:  item.disambiguation || '',
    genres:    item.tags?.slice(0, 5).map((t) => t.name) ?? [],
    saga:      null,
    platforms: [],
    source:    DATA_SOURCES.MUSICBRAINZ,
  };
}

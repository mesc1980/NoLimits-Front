/**
 * services/musicbrainz.js
 * Funciones de acceso a la API de MusicBrainz.
 * Documentación: https://musicbrainz.org/doc/MusicBrainz_API
 *
 * Completamente gratuita, sin API key.
 * Rate limit: 1 request/segundo — TanStack Query maneja el caché.
 */

import { apiFetch } from './api';
import { MUSICBRAINZ_BASE_URL } from '@/utils/constants';

/* MusicBrainz requiere User-Agent identificado */
const MB_HEADERS = {
  'User-Agent': 'nolimits/0.1.0 (proyecto-academico)',
  'Accept':     'application/json',
};

function mbUrl(path, params = {}) {
  const query = new URLSearchParams({ fmt: 'json', ...params });
  return `${MUSICBRAINZ_BASE_URL}${path}?${query}`;
}

/**
 * Busca release-groups (álbumes, soundtracks) por nombre.
 * @param {string} query
 * @param {number} limit
 */
export async function searchMusicReleaseGroups(query, limit = 100) {
  return apiFetch(
    mbUrl('/release-group', { query: `artist:${query} OR releasegroup:${query} OR recording:${query}`, limit }),
    { headers: MB_HEADERS }
  );
}

/**
 * Busca bandas sonoras (soundtracks) relacionadas con una franquicia.
 * @param {string} franchise — Nombre de la saga, ej: "Spider-Man"
 */
export async function searchSoundtrack(franchise) {
  return apiFetch(
    mbUrl('/release-group', {
      query: `releasegroup:"${franchise}" AND primarytype:Soundtrack`,
      limit: 10,
    }),
    { headers: MB_HEADERS }
  );
}

/**
 * Obtiene el detalle de un release-group por MBID.
 * @param {string} id
 */
export async function getMusicReleaseGroupDetail(id) {
  return apiFetch(
    mbUrl(`/release-group/${id}`, {
      inc: 'artist-credits+genres+tags+releases',
    }),
    { headers: MB_HEADERS }
  );
}

/**
 * Busca grabaciones (canciones) por título.
 * @param {string} query
 */
export async function searchRecordings(query, limit = 20) {
  return apiFetch(
    mbUrl('/recording', { query: `recording:"${query}"`, limit }),
    { headers: MB_HEADERS }
  );
}

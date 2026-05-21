/**
 * hooks/useMusicBrainz.js
 * Custom hooks para consumir MusicBrainz con TanStack Query.
 * API completamente gratuita y sin key.
 */

import { useQuery } from '@tanstack/react-query';
import { 
  searchMusicReleaseGroups, 
  searchSoundtrack, 
  getMusicReleaseGroupDetail, 
} from '@/services/musicbrainz';
import { normalizeMusicBrainzRelease } from '@/utils/normalizeMedia';

const STALE_TIME = 15 * 60 * 1000;

/**
 * Busca álbumes y release groups por término.
 * @param {string|null} query
 */
export function useMusicSearch(query) {
  return useQuery({
    queryKey: ['musicbrainz', 'search', query],
    queryFn: async () => {
      const res = await searchMusicReleaseGroups(query);
      return (res['release-groups'] ?? []).map(normalizeMusicBrainzRelease).slice(0, 18);
    },
    enabled:   Boolean(query?.trim()),
    staleTime: STALE_TIME,
  });
}

/**
 * Busca bandas sonoras de una franquicia.
 * @param {string|null} franchise
 */
export function useFranchiseSoundtracks(franchise) {
  return useQuery({
    queryKey: ['musicbrainz', 'soundtrack', franchise],
    queryFn: async () => {
      const res = await searchSoundtrack(franchise);
      return (res['release-groups'] ?? []).map(normalizeMusicBrainzRelease).slice(0, 18);
    },
    enabled:   Boolean(franchise?.trim()),
    staleTime: STALE_TIME,
  });
}

export function useMusicDetail(id) {
  return useQuery({
    queryKey: ['musicbrainz', 'detail', id],
    queryFn: async () => {
      const res = await getMusicReleaseGroupDetail(id);
      return normalizeMusicBrainzRelease(res);
    },
    enabled: Boolean(id),
    staleTime: STALE_TIME,
  });
}
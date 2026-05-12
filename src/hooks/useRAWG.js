/**
 * hooks/useRAWG.js
 * Custom hooks para consumir RAWG (video games) con TanStack Query.
 * Si VITE_RAWG_KEY no está configurada, retorna arrays vacíos sin error.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchTopGames, fetchGameDetail, rawgEnabled } from '@/services/rawg';
import { normalizeRawgGame } from '@/utils/normalizeMedia';

const STALE_TIME = 10 * 60 * 1000;

/** Top juegos por rating. */
export function useTopGames() {
  return useQuery({
    queryKey: ['rawg', 'top-games'],
    queryFn: async () => {
      if (!rawgEnabled()) return [];
      const res = await fetchTopGames();
      return (res.results ?? []).map(normalizeRawgGame);
    },
    staleTime: STALE_TIME,
  });
}

/** Detalle de un juego por ID de RAWG. */
export function useGameDetail(rawgId) {
  return useQuery({
    queryKey: ['rawg', 'game', rawgId],
    queryFn: async () => {
      const res = await fetchGameDetail(rawgId);
      if (!res) return null;
      return normalizeRawgGame(res);
    },
    enabled:   Boolean(rawgId) && rawgEnabled(),
    staleTime: STALE_TIME,
  });
}

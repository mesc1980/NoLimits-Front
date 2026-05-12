/**
 * hooks/useIGDB.js
 * Custom hooks para consumir IGDB con TanStack Query.
 *
 * En desarrollo: funciona vía proxy de Vite (/api/igdb/* → api.igdb.com).
 * En producción: requiere que el backend exponga /api/igdb/* como proxy.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchTopGames, fetchGameDetail } from '@/services/igdb';
import { normalizeIgdbGame }             from '@/utils/normalizeMedia';

const STALE_TIME = 10 * 60 * 1000;

/**
 * Top juegos por rating (bien valorados y con suficientes reseñas).
 * @returns {{ data: Obra[], isLoading, error }}
 */
export function useTopGames() {
  return useQuery({
    queryKey: ['igdb', 'top-games'],
    queryFn: async () => {
      const results = await fetchTopGames();
      return (results ?? []).map(normalizeIgdbGame);
    },
    staleTime: STALE_TIME,
  });
}

/**
 * Detalle de un juego por ID numérico de IGDB.
 * @param {string|number|null} igdbId
 */
export function useGameDetail(igdbId) {
  return useQuery({
    queryKey: ['igdb', 'game', igdbId],
    queryFn: async () => {
      const item = await fetchGameDetail(igdbId);
      if (!item) return null;
      return normalizeIgdbGame(item);
    },
    enabled:   Boolean(igdbId),
    staleTime: STALE_TIME,
  });
}

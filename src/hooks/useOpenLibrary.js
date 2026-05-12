/**
 * hooks/useOpenLibrary.js
 * Custom hooks para consumir Open Library con TanStack Query.
 * Expone: useBooksBySubject, useBookDetail
 *
 * Depende de: services/openLibrary.js · utils/normalizeMedia.js
 */

import { useQuery } from '@tanstack/react-query';
import { fetchBooksBySubject, fetchBookDetail } from '@/services/openLibrary';
import {
  normalizeOpenLibrarySubjectWork,
  normalizeOpenLibraryBook,
} from '@/utils/normalizeMedia';

/* Open Library es una API pública sin SLAs — 15 min es conservador */
const STALE_TIME = 15 * 60 * 1000;

/**
 * Libros destacados por tema (ciencia ficción, thriller, etc.).
 * Usado en la sección "Libros recomendados" del home.
 *
 * @param {string} subject - Ej: 'science_fiction'
 * @returns {{ data: Obra[], isLoading: boolean, error: Error|null }}
 */
export function useBooksBySubject(subject = 'science_fiction') {
  return useQuery({
    queryKey: ['openlibrary', 'subject', subject],
    queryFn: async () => {
      const res = await fetchBooksBySubject(subject);
      /* La API de subjects devuelve { works: [...] } */
      return (res.works ?? []).map(normalizeOpenLibrarySubjectWork);
    },
    staleTime: STALE_TIME,
  });
}

/**
 * Detalle de un libro por su key de Open Library.
 * @param {string|null} workKey - Ej: "/works/OL45804W"
 */
export function useBookDetail(workKey) {
  return useQuery({
    queryKey: ['openlibrary', 'work', workKey],
    queryFn: async () => {
      const raw = await fetchBookDetail(workKey);
      /* La API de detalle tiene un shape diferente al de búsqueda */
      return normalizeOpenLibraryBook({ ...raw, key: workKey });
    },
    enabled:   Boolean(workKey),
    staleTime: STALE_TIME,
  });
}

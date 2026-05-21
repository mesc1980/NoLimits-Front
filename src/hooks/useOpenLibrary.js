import { useQuery } from '@tanstack/react-query';
import { fetchBooksBySubject, fetchBookDetail } from '@/services/openLibrary';
import { normalizeGoogleBook } from '@/utils/normalizeMedia';

const STALE_TIME = 15 * 60 * 1000;

export function useBooksBySubject(subject = 'science_fiction') {
  return useQuery({
    queryKey: ['openlibrary', 'subject', subject],
    queryFn: async () => {
      const res = await fetchBooksBySubject(subject);
      return (res.items ?? []).map(normalizeGoogleBook);
    },
    staleTime: STALE_TIME,
  });
}

export function useBookDetail(workKey) {
  return useQuery({
    queryKey: ['openlibrary', 'work', workKey],
    queryFn: async () => {
      const raw = await fetchBookDetail(workKey);
      // Google Books devuelve el item directamente, no en un array
      return normalizeGoogleBook(raw);
    },
    enabled:   Boolean(workKey),
    staleTime: STALE_TIME,
  });
}
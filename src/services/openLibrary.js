import { OPENLIBRARY_BASE_URL } from '@/utils/constants';

const GOOGLE_BOOKS_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

export async function searchBooks(query, page = 1) {
  const startIndex = (page - 1) * 18;
  const params = new URLSearchParams({
    q: query,
    maxResults: 40,
    startIndex,
    printType: 'books',
    key: GOOGLE_BOOKS_KEY,
  });
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params}`);
  return res.json();
}

export async function fetchBooksBySubject(subject = 'science_fiction') {
  const params = new URLSearchParams({
    q: `subject:${subject}`,
    maxResults: 18,
    printType: 'books',
    orderBy: 'relevance',
    key: GOOGLE_BOOKS_KEY,
  });
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params}`);
  return res.json();
}

export async function fetchBookDetail(workKey) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${workKey}?key=${GOOGLE_BOOKS_KEY}`
  );
  return res.json();
}
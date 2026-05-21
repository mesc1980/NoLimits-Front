const BACKEND = import.meta.env.VITE_API_BASE_URL;

export async function searchBooks(query, page = 1) {
  const startIndex = (page - 1) * 18;
  const params = new URLSearchParams({
    q: query,
    maxResults: 40,
    startIndex,
    printType: 'books',
  });
  const res = await fetch(`${BACKEND}/api/books/volumes?${params}`);
  return res.json();
}

export async function fetchBooksBySubject(subject = 'science_fiction') {
  const params = new URLSearchParams({
    q: `subject:${subject}`,
    maxResults: 18,
    printType: 'books',
    orderBy: 'relevance',
  });
  const res = await fetch(`${BACKEND}/api/books/volumes?${params}`);
  return res.json();
}

export async function fetchBookDetail(workKey) {
  const res = await fetch(`${BACKEND}/api/books/volumes/${workKey}`);
  return res.json();
}
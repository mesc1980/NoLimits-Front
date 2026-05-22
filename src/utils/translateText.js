const BACKEND = import.meta.env.VITE_API_BASE_URL;

/**
 * Traduce un texto al español llamando al backend.
 * Si falla o no hay texto, devuelve el original.
 */
export async function translateToSpanish(text) {
  if (!text || text.trim() === '') return text;

  try {
    const res = await fetch(`${BACKEND}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) return text;

    const data = await res.json();
    return data.translated ?? text;
  } catch {
    return text; // fallback silencioso
  }
}
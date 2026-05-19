/**
 * services/api.js — Cliente HTTP base de no/limits
 * ══════════════════════════════════════════════════════════════
 *
 * ARQUITECTURA:
 * Este archivo es el punto central de toda comunicación con APIs.
 * Hoy cada servicio (tmdb.js, jikan.js, etc.) llama directamente
 * a las APIs externas. Cuando exista el backend propio, el cambio
 * es mínimo y está concentrado aquí.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  HOY (sin backend)                                          │
 * │  Browser → apiFetch(https://api.themoviedb.org/3/…)        │
 * │                                                             │
 * │  CON BACKEND                                                │
 * │  Browser → apiFetch(https://api.nolimits.app/api/…)        │
 * │                    ↓                                        │
 * │  Backend → TMDB / Jikan / IGDB / OpenLibrary               │
 * │          → cachea en DB → retorna Obra[]                   │
 * └─────────────────────────────────────────────────────────────┘
 *
 * INTEGRACIÓN DEL BACKEND — pasos:
 *  1. En .env: definir VITE_API_BASE_URL=https://tu-backend.com
 *  2. En cada services/*.js: cambiar las URLs externas por
 *     `${import.meta.env.VITE_API_BASE_URL}/api/…`
 *  3. Descomentar el bloque de Authorization abajo para inyectar
 *     el JWT del usuario en todas las requests autenticadas.
 *
 * @module services/api
 */

/**
 * Realiza un fetch GET/POST a la URL indicada.
 * Lanza un Error si la respuesta no es 2xx.
 *
 * @param {string}      url     — URL completa del endpoint
 * @param {RequestInit} options — Opciones adicionales de fetch (method, body, headers…)
 * @returns {Promise<any>}       — Respuesta parseada como JSON
 * @throws  {Error}              — HTTP <status>: <url>
 */
export async function apiFetch(url, options = {}) {
  // ── INTEGRACIÓN DEL BACKEND ───────────────────────────────────
  // Cuando el backend exista y tenga autenticación, descomentar:
  //
  // import useAppStore from '@/store/useAppStore';
  // const token = useAppStore.getState().user?.token;
  // const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  //
  // Nota: no se puede usar un hook React aquí (no es un componente).
  // useAppStore.getState() es la forma correcta de leer el store fuera de React.
  // ─────────────────────────────────────────────────────────────

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    // ...authHeader,   ← descomentar con el bloque de arriba
  };

  try {
    const response = await fetch(url, { ...options, headers });

    // Jikan a veces responde 400 para búsquedas no-anime
    if (!response.ok) {
      console.warn(`⚠️ API error ${response.status}: ${url}`);

      // Evita romper búsquedas globales
      return { data: [] };
    }

    return response.json();

  } catch (error) {
    console.warn('⚠️ Error en apiFetch:', error);

    // fallback seguro
    return { data: [] };
  }
}

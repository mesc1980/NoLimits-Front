/**
 * store/useAppStore.js — Estado global de no/limits
 * ══════════════════════════════════════════════════════════════
 *
 * Usa Zustand con el middleware `persist` para guardar datos en
 * localStorage. El estado se rehidrata automáticamente al recargar.
 *
 * SLICES:
 *  • user     — sesión del usuario (null = no autenticado)
 *  • myList   — obras guardadas personalmente
 *  • reviews  — reseñas personales por obraId
 *  • theme    — 'dark' (modo claro desactivado en v2.0)
 *
 * ── INTEGRACIÓN DEL BACKEND ───────────────────────────────────
 *
 *  AUTENTICACIÓN:
 *  Al hacer login exitoso, llamar: setUser({ id, name, email, token })
 *  El token se usará en services/api.js para el header Authorization.
 *
 *  SINCRONIZACIÓN DE LISTA:
 *  Hoy myList persiste solo en localStorage.
 *  Con backend, addToList/removeFromList deben llamar también a:
 *    POST   /api/user/list  → { obraId }
 *    DELETE /api/user/list/:obraId
 *  Y al inicio de sesión, cargar la lista desde el servidor:
 *    GET /api/user/list → reemplaza el myList local
 *
 *  SINCRONIZACIÓN DE RESEÑAS:
 *  Similar: setReview → POST /api/user/reviews
 *           deleteReview → DELETE /api/user/reviews/:obraId
 *
 *  TABLA DE DB RELACIONADA: users, user_lists, reviews (ver README.md)
 *
 * @module store/useAppStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({

      // ── USUARIO ─────────────────────────────────────────────
      // Estructura esperada del backend:
      // { id: string, name: string, email: string, token: string, avatar?: string }
      user: null,

      /**
       * Guarda el usuario tras un login exitoso.
       * El token en user.token se inyectará en services/api.js.
       * @param {{ id, name, email, token, avatar? }} user
       */
      setUser: (user) => set({ user }),

      /**
       * Limpia la sesión al hacer logout.
       * También limpiar localStorage.removeItem('auth_token') en el componente.
       */
      /*clearUser: () => set({ user: null }),*/
      clearUser: () => {
        localStorage.removeItem('nl_auth');
        localStorage.removeItem('nl_user');
        localStorage.removeItem('nl_role');
        localStorage.removeItem('nl_token');

        set({ user: null });
      },

      // ── MI LISTA ─────────────────────────────────────────────
      // Tabla relacionada: user_lists (user_id, obra_id, created_at)
      myList: [],

      /**
       * Agrega una obra a la lista. Ignora duplicados.
       * INTEGRACIÓN BACKEND: también llamar POST /api/user/list
       * @param {Object} obra — Objeto normalizado al modelo Obra
       */
      addToList: (obra) => {
        const { myList } = get();
        if (myList.some((item) => item.id === obra.id)) return;
        set({ myList: [...myList, obra] });
        // TODO backend: apiFetch(`${API}/api/user/list`, { method: 'POST', body: JSON.stringify({ obraId: obra.id }) })
      },

      /**
       * Elimina una obra de la lista por su ID compuesto.
       * INTEGRACIÓN BACKEND: también llamar DELETE /api/user/list/:obraId
       * @param {string} obraId — ej: "tmdb:movie:12345"
       */
      removeFromList: (obraId) => {
        set((state) => ({ myList: state.myList.filter((item) => item.id !== obraId) }));
        // TODO backend: apiFetch(`${API}/api/user/list/${encodeURIComponent(obraId)}`, { method: 'DELETE' })
      },

      /**
       * Alterna el estado de guardado de una obra.
       * @param {Object} obra
       */
      toggleList: (obra) => {
        const { isInList, addToList, removeFromList } = get();
        if (isInList(obra.id)) removeFromList(obra.id);
        else addToList(obra);
      },

      /** @param {string} obraId @returns {boolean} */
      isInList: (obraId) => get().myList.some((item) => item.id === obraId),

      // ── RESEÑAS ──────────────────────────────────────────────
      // Tabla relacionada: reviews (user_id, obra_id, content, rating, updated_at)
      // Hoy: { [obraId]: string }
      // Con backend: { [obraId]: { content: string, rating: number } }
      reviews: {},

      /**
       * Guarda o actualiza la reseña de una obra.
       * INTEGRACIÓN BACKEND: POST /api/user/reviews
       * @param {string} obraId
       * @param {string} text
       */
      setReview: (obraId, text) =>
        set((state) => ({ reviews: { ...state.reviews, [obraId]: text } })),

      /** @param {string} obraId @returns {string} */
      getReview: (obraId) => get().reviews[obraId] ?? '',

      /**
       * Elimina la reseña.
       * INTEGRACIÓN BACKEND: DELETE /api/user/reviews/:obraId
       */
      deleteReview: (obraId) =>
        set((state) => {
          const updated = { ...state.reviews };
          delete updated[obraId];
          return { reviews: updated };
        }),

      // ── TEMA ─────────────────────────────────────────────────
      // Modo claro desactivado en v2.0 (dark-first por diseño del brandbook).
      theme: 'dark',
      toggleTheme: () => { /* no-op: dark mode permanente en v2.0 */ },

    }),

    {
      name: 'nolimits-store',

      // Solo persiste estos campos — user NO se persiste (el token
      // debe revalidarse con el backend en cada sesión).
      partialize: (state) => ({
        user: state.user,
        myList:  state.myList,
        reviews: state.reviews,
        theme:   state.theme,
      }),
    }
  )
);

export default useAppStore;

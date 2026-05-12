/**
 * main.jsx — Entry point de la aplicación no/limits.
 *
 * Responsabilidades:
 *  1. Carga fuentes self-hosted (@fontsource)
 *  2. Importa estilos globales en orden (tokens → globals → animations → components)
 *  3. Configura el QueryClient de TanStack Query
 *  4. Monta la app con React.StrictMode
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/* ── Fuentes self-hosted (sin CDN externo) ── */
import '@fontsource/geist/400.css';
import '@fontsource/geist/600.css';
import '@fontsource/geist/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';

/* ── Estilos globales en orden de dependencia ── */
import './styles/tokens.css';
import './styles/globals.css';
import './styles/animations.css';
import './styles/components.css';

import App from './App';

/* QueryClient: 3 reintentos automáticos, ventana de enfoque no refetch */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              2,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

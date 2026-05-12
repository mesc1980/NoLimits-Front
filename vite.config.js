/**
 * vite.config.js
 * Configuración de Vite 5 para no/limits.
 *
 * IGDB proxy:
 *   En desarrollo, /api/igdb/* → https://api.igdb.com/v4/*
 *   Vite inyecta Client-ID y Authorization en el servidor antes de reenviar.
 *   Así el browser nunca ve los headers de auth ni tiene problemas de CORS.
 *
 *   En producción (build), el proxy no existe → el backend debe exponer
 *   /api/igdb/* como endpoint propio con las mismas credenciales.
 */

import { defineConfig, loadEnv } from 'vite';
import react  from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  /* Lee variables de .env para usarlas en el proxy (Node.js context) */
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },

    server: {
      proxy: {
        '/api/igdb': {
          target:       'https://api.igdb.com/v4',
          changeOrigin: true,

          /* Elimina el prefijo /api/igdb de la ruta antes de enviar */
          rewrite: (path) => path.replace(/^\/api\/igdb/, ''),

          /* Inyecta los headers de IGDB en cada request al proxy */
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Client-ID',     env.VITE_IGDB_CLIENT_ID  ?? '');
              proxyReq.setHeader('Authorization', `Bearer ${env.VITE_IGDB_TOKEN ?? ''}`);
              proxyReq.setHeader('Content-Type',  'text/plain');
            });
          },
        },
      },
    },
  };
});

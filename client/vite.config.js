import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Dev-only proxy: all backend routes are under `/api` so they never clash with
 * React Router paths like `/payouts` or `/vendors` (refresh must serve index.html).
 * Rewrite strips `/api` before forwarding to Express.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});

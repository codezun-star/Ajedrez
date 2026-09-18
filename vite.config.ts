import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
// @ts-expect-error — plain ESM helper, no declaration file to import.
import { blogIndexPlugin } from './scripts/blog-index-plugin.mjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), blogIndexPlugin()],
  // Absolute, NOT './'. With a relative base the bundle is referenced as
  // `./assets/…`, which a nested route like /de/blog/schachregeln resolves
  // against its own directory (/de/blog/assets/…) and 404s, leaving a blank
  // page. Every route below the root depends on this being '/'.
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
  worker: {
    format: 'es',
  },
});

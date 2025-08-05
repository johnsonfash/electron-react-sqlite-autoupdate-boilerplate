// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  root: './src/renderer',
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  base: mode === 'development' ? '/' : './', // <-- Important: use relative paths in production
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    target: 'esnext',
    assetsDir: 'assets', // ensure all assets go in a predictable folder
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/database/**'], // <-- Ignore all files inside /database
    },
  },
}));

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      test: {
        environment: 'jsdom',
        setupFiles: './test/setup.ts',
        globals: true,
        css: true,
      },
      plugins: [react()],
      base: process.env.VITE_BASE ?? "/",
      define: {
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

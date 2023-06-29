import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import topLevelAwait from 'vite-plugin-top-level-await';


// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
    sourcemap: true,
    // target: 'esnext'
  },
  server: {
    open: true,
  },
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
    },
  },
  plugins: [
    react(),
    svgrPlugin(),
    topLevelAwait()
  ],
});
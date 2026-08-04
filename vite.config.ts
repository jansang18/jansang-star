/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/icon.svg'],
    manifest: {
      name: '잔상 별자리', short_name: '잔상별자리',
      description: '태어난 순간의 별빛과 오늘의 흐름을 읽는 별자리 만세력',
      theme_color: '#6f62d4', background_color: '#e8f7ff', display: 'standalone', start_url: '/',
      icons: [{ src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,wasm,data}'], maximumFileSizeToCacheInBytes: 4_000_000 },
  })],
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: { exclude: ['swisseph-wasm'] },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});

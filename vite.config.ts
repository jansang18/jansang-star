/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const base = mode === 'pages' ? '/jansang-star/' : '/';
  return {
  base,
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/icon.svg'],
    manifest: {
      name: '잔상 별자리 · Jansang Star', short_name: '잔상별자리',
      description: 'Detailed bilingual natal chart and horoscope · 한영 별자리 만세력',
      theme_color: '#11100E', background_color: '#F3EFE7', display: 'standalone', start_url: base,
      icons: [{ src: `${base}icons/icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,wasm,data,json}'],
      maximumFileSizeToCacheInBytes: 6_000_000,
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
    },
  })],
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: { exclude: ['swisseph-wasm'] },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['**/.worktrees/**', '**/node_modules/**', '**/dist/**'],
  },
  };
});

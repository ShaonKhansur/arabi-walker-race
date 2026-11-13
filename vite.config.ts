import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/bg/*.jpg', 'assets/sprites/*.png', 'assets/audio/*.wav', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: "Arabi's Walker Run",
        short_name: "আরাবির রান",
        description: "আরাবি ওয়াকার নিয়ে ছুটছে, আর আরাফ, আদিবা ও আনাম তাকে ধরার চেষ্টা করছে!",
        theme_color: '#0284c7',
        background_color: '#f0f9ff',
        display: 'fullscreen',
        orientation: 'landscape',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}']
      }
    })
  ],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true
  }
});


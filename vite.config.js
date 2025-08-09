import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Gestor de Campañas D&D',
        short_name: 'D&D Manager',
        description: 'Mi gestor personal de campañas de Dungeons & Dragons',
        theme_color: '#8B5CF6',
        background_color: '#1F2937',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    // Optimización de chunks para mejor performance
    rollupOptions: {
      output: {
        // Manual chunking para librerías pesadas
        manualChunks: {
          // Librerías de UI pesadas en chunk separado
          'editor-libs': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-color', '@tiptap/extension-text-style'],
          // Iconos en chunk separado
          'icon-libs': ['lucide-react'],
          // Chunk para React y dependencias core
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    // Incrementar límite de warnings para chunks grandes
    chunkSizeWarningLimit: 600,
    // Optimizar assets
    assetsInlineLimit: 4096
  },
  server: {
    port: 4000,
    host: '127.0.0.1',    // ← IPv4 explícito
    open: true,           // ← Abre navegador automáticamente
    strictPort: false     // ← Busca puerto libre automáticamente si está ocupado
  }
})
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Excluir imágenes de backgrounds del precache — son decorativas y el
      // navegador las cacheará automáticamente con la caché HTTP normal.
      globIgnores: ['backgrounds/**', 'vintage_bg.png'],
      includeAssets: [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png',
        'screenshot-desktop.png',
        'screenshot-mobile.png'
      ],
      devOptions: {
        enabled: true
      },
      manifest: {
        id: '/Nosotros/',
        name: 'Santi & Cami',
        short_name: 'SyC',
        description: 'Nuestro espacio especial',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: './',
        protocol_handlers: [
          {
            protocol: 'web+syc',
            url: './?action=%s'
          }
        ],
        scope: './',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1024x1024',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Pantalla principal en escritorio'
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '1024x1024',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Pantalla principal en celular'
          }
        ]
      }
    })
  ],
  base: '/Nosotros/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    watch: {
      // En Windows el watcher nativo falla con EBUSY cuando se copia un archivo
      // mientras otro proceso lo tiene bloqueado. El polling evita ese crash.
      usePolling: true,
      interval: 500,
      // Esperar a que el archivo termine de escribirse antes de disparar HMR
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase'
          }
          if (id.includes('node_modules/@iconify')) {
            return 'vendor-iconify'
          }
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia')) {
            return 'vendor-vue'
          }
        }
      }
    }
  }
})
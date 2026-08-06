import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Santi & Cami',
        short_name: 'SyC',
        description: 'Nuestro espacio especial',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Hace que abra como app nativa sin barra de navegador
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
  }
})

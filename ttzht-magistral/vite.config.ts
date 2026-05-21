import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Должен стоять первым для корректного перехвата WebSocket
      '/test/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
        rewriteWsOrigin: true,
      },

      // ПРОКСИ ДЛЯ ТЕСТОВ
      '^/test/(start|submit|finish|violate|reset|whoami|ai_question|modify)': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },

      // СТАНДАРТНЫЕ СИСТЕМНЫЕ ПУТИ
      '/auth': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/groups': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/tests': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/questions': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/group': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/export': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/escalate': { target: 'http://127.0.0.1:8000', changeOrigin: true },

      // ХРАНИЛИЩЕ И ФАЙЛЫ
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
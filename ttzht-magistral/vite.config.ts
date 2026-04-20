import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Должен стоять первым для корректного перехвата
      '/test/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
        rewriteWsOrigin: true,
      },

      //ПРОКСИ ДЛЯ ТЕСТОВ
      // Ловим только API-запросы: /test/start, /test/submit и т.д.
      '^/test/(start|submit|finish|violate|reset|whoami|ai_question|modify)': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },

      //СТАНДАРТНЫЕ СИСТЕМНЫЕ ПУТИ
      '/auth': 'http://127.0.0.1:8000',
      '/groups': 'http://127.0.0.1:8000',
      '/tests': 'http://127.0.0.1:8000',
      
      // Пути для создания групп /group/create и т.д.
      '/group': 'http://127.0.0.1:8000',

      // ХРАНИЛИЩЕ И ФАЙЛЫ
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
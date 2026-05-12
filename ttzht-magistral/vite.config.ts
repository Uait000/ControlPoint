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

      // ПРОКСИ ДЛЯ ТЕСТОВ
      '^/test/(start|submit|finish|violate|reset|whoami|ai_question|modify)': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },

      // СТАНДАРТНЫЕ СИСТЕМНЫЕ ПУТИ
      '/auth': 'http://127.0.0.1:8000',
      '/groups': 'http://127.0.0.1:8000',
      '/tests': 'http://127.0.0.1:8000',
      '/questions': 'http://127.0.0.1:8000',
      '/group': 'http://127.0.0.1:8000',
      
      '/export': 'http://127.0.0.1:8000',    // Для экспорта отчетов (HTML/PDF)
      '/escalate': 'http://127.0.0.1:8000',  // Для эскалации курсов в админке


      // ХРАНИЛИЩЕ И ФАЙЛЫ
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
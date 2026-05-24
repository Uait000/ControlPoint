import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // ДОБАВЛЕНО: Указываем Vite собирать проект прямо в папку сервера
  build: {
    // Вставь сюда точный абсолютный путь к папке public в Open Server
    outDir: 'C:/OSPanel/home/magistral.local/public',
    // Очищать папку перед новой сборкой, чтобы не копился мусор
    emptyOutDir: true 
  },

  server: {
    port: 5173, 
    proxy: {
      '/test/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
      },
      '^/test/(start|submit|finish|violate|reset|whoami|ai_question|modify)': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/auth': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/groups': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/tests': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/questions': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/group': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/export': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/escalate': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/storage': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    }
  }
})
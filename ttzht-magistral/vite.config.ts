import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/groups': 'http://127.0.0.1:8000',
      '/courses': 'http://127.0.0.1:8000',
      '/tests': 'http://127.0.0.1:8000',
      
      // ВАЖНО: Проксируем строго методы, а не сами страницы тестов
      '/test/start': 'http://127.0.0.1:8000',
      '/test/submit': 'http://127.0.0.1:8000',
      '/test/violate': 'http://127.0.0.1:8000',
      '/test/reset': 'http://127.0.0.1:8000',
      
      '/test/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        rewriteWsOrigin: true,
      }
    }
  }
})
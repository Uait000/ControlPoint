import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://127.0.0.1:8000',

      '/groups': 'http://127.0.0.1:8000',


      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },


      '/tests': 'http://127.0.0.1:8000',
      

      '/test/start': 'http://127.0.0.1:8000',
      '/test/submit': 'http://127.0.0.1:8000',
      '/test/violate': 'http://127.0.0.1:8000',
      '/test/reset': 'http://127.0.0.1:8000',
      '/test/whoami': 'http://127.0.0.1:8000',
      '/test/question': 'http://127.0.0.1:8000',
      '/test/questions': 'http://127.0.0.1:8000',
      

      '/test/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        rewriteWsOrigin: true,
      }
    }
  }
})
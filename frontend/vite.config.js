import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // Local dev: proxy to local backend
      '/api': {
        target: 'http://localhost:5186',
        changeOrigin: true
      }
    }
  },
  define: {
    // Makes VITE_API_URL available in production builds
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || '')
  }
})

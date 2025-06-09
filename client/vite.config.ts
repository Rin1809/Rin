import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  server: {
    proxy: {
      // Proxy các request từ /api đến server backend của bạn
      '/api': {
        target: 'http://localhost:3001', // Backend đang chạy trên cổng 3001
        changeOrigin: true, // Cần thiết cho virtual-hosted sites
        secure: false, // Hữu ích nếu backend dùng http
      },
    },
  },
})
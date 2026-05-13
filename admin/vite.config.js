import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/assets/admin/',
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3900'
    }
  },
  build: {
    outDir: '../server/public/admin',
    emptyOutDir: true
  }
})

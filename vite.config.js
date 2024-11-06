import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/jr_reporter/',
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  }
})
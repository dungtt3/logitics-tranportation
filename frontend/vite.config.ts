import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const apiUrl = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:5140'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': apiUrl,
      '/health': apiUrl,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    restoreMocks: true,
  },
})

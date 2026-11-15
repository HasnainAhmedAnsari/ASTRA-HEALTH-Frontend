import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev: the API runs on :8000 and is proxied. Production: FastAPI serves the built files itself.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': 'http://localhost:8000', '/health': 'http://localhost:8000' } },
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 1200 },
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Configuración de Vite con puerto dedicado y exclusivo para EFSRT II
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5190,
    strictPort: true,
    host: true
  }
})

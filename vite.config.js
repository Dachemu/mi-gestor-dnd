import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    host: '127.0.0.1',    // ← IPv4 explícito
    open: true,           // ← Abre navegador automáticamente
    strictPort: false     // ← Busca puerto libre automáticamente si está ocupado
  }
})
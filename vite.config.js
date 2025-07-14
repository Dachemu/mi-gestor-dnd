import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '127.0.0.1',    // ← IPv4 explícito
    open: true,           // ← Abre navegador automáticamente
    strictPort: true      // ← Falla si el puerto está ocupado
  }
})
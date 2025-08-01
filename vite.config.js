import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          xlsx: ['sheetjs-style']
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true
  },
  define: {
    global: 'globalThis',
  },
})

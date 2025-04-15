import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173, // Port for the Vite dev server
    open: true, // Automatically open the browser when server starts
  },
  plugins: [react()],
  base: './',
  build:{
    outDir: 'dist/assets',
    rollupOptions: {
      output: {
        assetFileNames: '[name]-[hash][extname]', // Go up one level to place other assets in 'dist'
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
      },
    },
  }
})

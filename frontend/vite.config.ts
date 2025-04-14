import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
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

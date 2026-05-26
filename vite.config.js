import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    strictPort: false,
    proxy: {
      '/api/send-email-event': {
        target: 'https://email-server-n4by.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/send',
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          vendors: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion', 'react-confetti'],
        },
      },
    },
  },
})

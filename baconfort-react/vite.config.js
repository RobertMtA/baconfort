import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/baconfort/', // Agregamos la base para GitHub Pages
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          bootstrap: ['bootstrap', 'react-bootstrap'],
          icons: ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons', 'react-icons']
        }
      }
    }
  }
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()],
  server: {
    port: 5173, // Fuerza el puerto 5173 (como la configuración de cors del backend)
  },
  preview: {
    port: 5173, 
  },
});


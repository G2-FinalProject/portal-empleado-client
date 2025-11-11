/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // Fuerza el puerto 5173 (como la configuración de CORS del backend)
  },
  preview: {
    port: 5173,
  },
  // 🧪 Configuración de Vitest

test: {
  globals: true,
  environment: "jsdom",
  setupFiles: "./src/test/setupTests.js",
  isolate: false,
  pool:'threads', 

  // ✅ Cobertura
  coverage: {
  provider: "v8",
  reporter: ["text", "html", "text-summary", "json-summary"],
  reportsDirectory: "./coverage",
  all: true,
  include: ["src/**/*.{js,jsx}"],
  exclude: [
    "src/test/**",
    "node_modules/**",
    "vite.config.*",
    "**/mocks/**",
    "**/*.d.ts",
  ],
},
},

})

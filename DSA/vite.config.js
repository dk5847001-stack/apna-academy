import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  process.env.VITE_DSA_URL ||= env.VITE_DSA_URL || "http://localhost:5173";
  process.env.VITE_API_BASE_URL ||= env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

  return {
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: true,
  },
  }; 
})

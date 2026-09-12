import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    host: "localhost",
    port: 5175,
    strictPort: true,
  },

  preview: {
    host: "localhost",
    port: 5175,
    strictPort: true,
  },

  build: {
    target: "es2022",
    sourcemap: false,
  },
});
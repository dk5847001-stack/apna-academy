import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "localhost",
    port: 5176,
    strictPort: true,
  },
  preview: {
    host: "localhost",
    port: 5176,
    strictPort: true,
  },
  build: {
    target: "es2022",
    sourcemap: false,
  },
});

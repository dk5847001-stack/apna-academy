import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    // Keep React, React DOM and Emotion as single instances in the Vite bundle.
    // This prevents invalid-hook-call and duplicate-Emotion runtime errors when
    // the dashboard is developed alongside the other ApnaAcademy apps.
    dedupe: ["react", "react-dom", "@emotion/react", "@emotion/styled"],
  },

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
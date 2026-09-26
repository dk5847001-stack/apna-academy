import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const getManualChunk = (id) => {
  if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
    return 'react'
  }

  if (
    id.includes('/node_modules/@mui/') ||
    id.includes('/node_modules/@emotion/')
  ) {
    return 'mui'
  }

  return undefined
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: getManualChunk,
      },
    },
  },
})

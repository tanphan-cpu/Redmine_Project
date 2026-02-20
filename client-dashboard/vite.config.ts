import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/redmine-api': {
        target: 'https://projects.rsupport.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/redmine-api/, ''),
      },
    },
  },
})

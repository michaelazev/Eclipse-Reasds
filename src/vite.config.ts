import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill process for libraries that need it
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  }
})
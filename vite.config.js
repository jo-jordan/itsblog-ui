import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// `npx wrangler dev` serves the API and photos locally
const worker = 'http://127.0.0.1:8787'

export default defineConfig({
  plugins: [
    vue({
      template: {
        // Spaces between inline elements are part of the layout
        compilerOptions: { whitespace: 'preserve' }
      }
    })
  ],
  // VUE_APP_CARTO_KEY predates the move to Vite and is still read
  envPrefix: ['VITE_', 'VUE_APP_'],
  build: {
    outDir: 'itsblog-ui',
    // public/_headers caches everything under /static for a year
    assetsDir: 'static',
    emptyOutDir: true
  },
  server: {
    port: 9528,
    strictPort: true,
    proxy: {
      '/api': worker,
      '/media': worker
    }
  }
})

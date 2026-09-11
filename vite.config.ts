import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// BUILD_TARGET selects a single entry for production builds so each
// standalone HTML page bundles fully self-contained (no shared chunks
// split across entries) — needed so each can be inlined into one file.
const target = process.env.BUILD_TARGET

const singleEntryInput: Record<string, string> | undefined =
  target === 'customer'
    ? { customer: resolve(import.meta.dirname, 'customer.html') }
    : target === 'main'
      ? { main: resolve(import.meta.dirname, 'index.html') }
      : undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: target ? `dist-${target}` : 'dist',
    // Inline image assets (e.g. the logo) as base64 so each production
    // build stays a single self-contained JS/CSS pair with no separate
    // asset files — required so the whole page can be inlined into one
    // standalone HTML artifact.
    assetsInlineLimit: 200 * 1024,
    rollupOptions: {
      input:
        singleEntryInput ?? {
          main: resolve(import.meta.dirname,'index.html'),
          customer: resolve(import.meta.dirname,'customer.html'),
        },
    },
  },
})

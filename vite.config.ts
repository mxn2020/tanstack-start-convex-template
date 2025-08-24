import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      customViteReactPlugin: true,
    }),
    react(),
  ],
  build: {
    rollupOptions: {
      external: [
        'node:async_hooks',
        'path',
        'os',
        'fs/promises',
        '@prisma/client/runtime/library'
      ]
    }
  },
  ssr: {
    noExternal: ['better-auth'],
    external: ['@prisma/client']
  },
  optimizeDeps: {
    exclude: ['@prisma/client']
  },
  define: {
    global: 'globalThis',
  }
})

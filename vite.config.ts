import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'node:path'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: { build: { outDir: 'dist-electron', sourcemap: true } },
      },
      {
        entry: 'electron/preload.ts',
        onstart(args) { args.reload() },
        vite: { build: { outDir: 'dist-electron', sourcemap: true } },
      },
    ]),
    renderer(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/*.spec.ts', // Exclude Playwright spec files
      '**/e2e/**'     // Exclude e2e test directory
    ],
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})

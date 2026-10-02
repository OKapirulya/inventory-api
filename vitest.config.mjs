import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    env: {
      NODE_ENV: 'test',
    },
    coverage: {
      reporter: ['text', 'json'],
      exclude: ['node_modules/**', 'dist/**'],
    },
  },
})

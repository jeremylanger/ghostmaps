import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: '*.e2e.test.ts',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5174',
    headless: false,
  },
})

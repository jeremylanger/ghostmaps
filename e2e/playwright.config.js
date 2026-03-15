const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: '.',
  testMatch: '*.e2e.test.js',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5174',
    headless: false,
  },
})

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.e2e.test.ts",
  timeout: 60000,
  use: {
    baseURL: "https://localhost:5174",
    headless: true,
    ignoreHTTPSErrors: true,
  },
});

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',

  testMatch: [
    '**/*.e2e.test.js',
    '**/*.playwright.test.js',
  ],

  timeout: 30000,

  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
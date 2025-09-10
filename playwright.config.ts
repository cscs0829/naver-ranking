import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  use: {
    baseURL: 'https://naverranking-nine.vercel.app',
    headless: true,
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Pixel 7', use: { ...devices['Pixel 7'] } },
    { name: 'iPhone 13', use: { ...devices['iPhone 13'] } },
    { name: 'Macbook 13 (custom)', use: { viewport: { width: 1280, height: 800 } } },
  ],
})



import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests',
  timeout: 90000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8765',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
      args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  webServer: {
    command: 'python -m http.server 8765 --bind 127.0.0.1',
    url: 'http://127.0.0.1:8765',
    reuseExistingServer: !process.env.CI,
  },
});

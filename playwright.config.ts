import { defineConfig } from "@playwright/test";
export default defineConfig({
  timeout: 90000,
  expect: { timeout: 15000 },
  testDir: "./tests",
  testMatch: "e2e.spec.ts",
  workers: 1,
  use: {
    baseURL: "http://localhost:3100",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      DATABASE_URL: "file:./e2e.db",
      NEXTAUTH_URL: "http://localhost:3100",
      NEXTAUTH_SECRET: "test-only-secret-for-isolated-database-123456789",
    },
  },
});

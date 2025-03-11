import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";
import { testUsers } from "./tests/config/test-users.config";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: "html",
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    headless: true,
    launchOptions: {
      slowMo: 100,
    },
    actionTimeout: 10000,
  },
  projects: [
    {
      name: "setup",
      testDir: "./tests",
      testMatch: /.*\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-login",
      testMatch: /login\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "chromium-authenticated",
      testIgnore: /login\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: testUsers.admin.storageState,
      },
      dependencies: ["setup"],
    },
    // Add other browsers as needed (Firefox, Safari)
  ],
});

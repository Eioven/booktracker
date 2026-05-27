import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const API_URL = process.env.API_URL ?? 'http://127.0.0.1:8000'
const IS_CI = !!process.env.CI
const START_SERVERS = (process.env.START_WEB_SERVERS ?? 'true') === 'true'
const DEBUG_ARTIFACTS = (process.env.DEBUG_ARTIFACTS ?? 'false') === 'true'

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',

  timeout: 60_000,
  expect: { timeout: 10_000 },

  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 2 : Number(process.env.WORKERS ?? 4),

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: false,
        environmentInfo: {
          framework: 'Playwright',
          node: process.version,
          os: process.platform,
          base_url: BASE_URL,
          api_url: API_URL,
          environment: process.env.ALLURE_ENVIRONMENT ?? 'local',
        },
      },
    ],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: BASE_URL,

    trace: DEBUG_ARTIFACTS ? 'on' : 'retain-on-failure',
    screenshot: DEBUG_ARTIFACTS ? 'on' : 'only-on-failure',
    video: DEBUG_ARTIFACTS ? 'on' : 'retain-on-failure',

    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',

    headless: (process.env.HEADLESS ?? 'true') === 'true',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      grep: /@critical|@smoke/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      grep: /@critical|@smoke/,
    },

    ...(IS_CI
      ? []
      : [
          {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 7'] },
            grep: /@smoke/,
          },
          {
            name: 'mobile-safari',
            use: { ...devices['iPhone 14'] },
            grep: /@smoke/,
          },
        ]),
  ],

  webServer: START_SERVERS
    ? [
        {
          command: `${process.env.BACKEND_PYTHON ?? 'python'} manage.py migrate --noinput && ${process.env.BACKEND_PYTHON ?? 'python'} manage.py runserver 127.0.0.1:8000`,
          cwd: path.resolve(__dirname, '../backend'),
          url: `${API_URL}/api/auth/me/`,
          reuseExistingServer: !IS_CI,
          timeout: 120_000,

          ignoreHTTPSErrors: true,
          env: {
            ...(process.env.DYLD_LIBRARY_PATH ? { DYLD_LIBRARY_PATH: process.env.DYLD_LIBRARY_PATH } : {}),
          },
        },
        {
          command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
          cwd: path.resolve(__dirname, '../frontend'),
          url: BASE_URL,
          reuseExistingServer: !IS_CI,
          timeout: 120_000,
        },
      ]
    : undefined,
})

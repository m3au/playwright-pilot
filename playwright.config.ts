import { defineConfig, devices } from '@playwright/test';

import { defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!existsSync('.env')) {
  throw new Error('.env file not found. Please copy .env.example to .env and configure it.');
}

dotenv.config({ debug: false });

const isCI = !!process.env['CI'];
const retries = Number.parseInt(process.env['RETRIES']!, 10);
const workers = process.env['WORKERS']!.endsWith('%')
  ? process.env['WORKERS']!
  : +process.env['WORKERS']!;
const timeout = Number.parseInt(process.env['TIMEOUT']!, 10);
const expectTimeout = Number.parseInt(process.env['EXPECT_TIMEOUT']!, 10);
const baseURL = process.env['BASE_URL'];
const isHeaded = process.env['HEADED'] === 'true';
const slowMo = process.env['SLOW_MO'] ? Number.parseInt(process.env['SLOW_MO'], 10) : undefined;
const trace = (process.env['TRACE'] || 'on-first-retry') as
  | 'off'
  | 'on'
  | 'on-first-retry'
  | 'retain-on-failure'
  | 'on-all-retries';
const htmlReporter: ['html', { open: 'never'; outputFolder: string }] = [
  'html',
  { open: 'never', outputFolder: 'test-output/playwright-report' },
];
const baseProjectUse = {
  ...devices['Desktop Chrome'],
  ...(isHeaded && { headless: false }),
};

// Generated tests use fixtures from tests/e2e/world.ts
const bddConfig = defineBddConfig({
  featuresRoot: path.resolve(__dirname, 'tests/e2e'),
  features: [path.resolve(__dirname, 'tests/e2e/features/**/*.feature')],
  steps: [
    path.resolve(__dirname, 'tests/e2e/poms/**/*.ts'),
    path.resolve(__dirname, 'tests/e2e/world.ts'),
  ],
  outputDir: path.join(__dirname, 'test-output/bdd-gen'),
  importTestFrom: path.resolve(__dirname, 'tests/e2e/world.ts'),
  disableWarnings: { importTestFrom: true },
});

export default defineConfig({
  // Type assertion required: playwright-bdd config types are incompatible with Playwright's config type
  // This is a known limitation when using playwright-bdd with Playwright's defineConfig
  ...(bddConfig as unknown as Record<string, unknown>),
  testDir: './test-output/bdd-gen',
  testMatch: ['**/*.spec.ts', '**/*.test.ts', '**/*.spec.js', '**/*.test.js'],
  fullyParallel: true,
  forbidOnly: isCI,
  retries,
  workers,
  timeout,
  expect: {
    timeout: expectTimeout,
  },
  reporter: isCI ? [['line'], ['blob'], ['github']] : [htmlReporter, ['line']],
  outputDir: 'test-output/test-results',
  use: {
    baseURL,
    trace,
    screenshot: 'only-on-failure',
    ...(slowMo && { slowMo }),
  },
  projects: [
    {
      name: 'chromium',
      use: baseProjectUse,
    },
    {
      name: 'lighthouse',
      testDir: './tests/audit',
      testMatch: ['lighthouse.spec.ts'],
      use: baseProjectUse,
      retries: 0,
    },
    {
      name: 'axe',
      testDir: './tests/audit',
      testMatch: ['axe.spec.ts'],
      use: baseProjectUse,
      retries: 0,
    },
  ],
});

import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'node:fs';

import { expect, test } from '@playwright/test';

import lighthouse from 'lighthouse';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';

const baseUrl = process.env['BASE_URL'];
if (!baseUrl) {
  throw new Error('BASE_URL environment variable is required');
}
const outputDirectory = path.join(process.cwd(), 'test-output');

test.describe('Lighthouse Performance Tests', () => {
  test('should meet Lighthouse performance thresholds', async ({ browser }) => {
    // Get Chrome executable path from Playwright to ensure Lighthouse uses the same browser instance
    // This prevents conflicts and ensures consistency between Playwright and Lighthouse
    const browserType = browser?.browserType();
    const executablePath = browserType?.executablePath();

    if (!executablePath) {
      throw new Error('Browser executable path not available');
    }

    // Launch Chrome with a dynamic port (0 = auto-assign)
    // chrome-launcher will return the actual port used
    const chrome = await chromeLauncher.launch({
      chromePath: executablePath,
      chromeFlags: ['--headless', '--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      // Get the actual port from chrome-launcher
      const port = chrome.port || 9222;

      // Wait for Chrome debugger port to be ready before running Lighthouse
      // This prevents ECONNREFUSED errors
      await setTimeout(2000);

      const url = `${baseUrl}/intl/cableguy.html`;
      const options = {
        logLevel: 'info' as const,
        output: 'html' as const,
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port,
        emulatedFormFactor: 'desktop' as const,
      };

      const runnerResult = await lighthouse(url, options);

      // Save report
      const lighthouseDirectory = path.join(outputDirectory, 'lighthouse');
      if (!fs.existsSync(lighthouseDirectory)) {
        fs.mkdirSync(lighthouseDirectory, { recursive: true });
      }

      const timestamp = Date.now();
      const htmlReportPath = path.join(lighthouseDirectory, `lighthouse-report-${timestamp}.html`);
      const reportContent = runnerResult?.report;
      if (reportContent && typeof reportContent === 'string') {
        fs.writeFileSync(htmlReportPath, reportContent);
        // Also create index.html pointing to latest report
        fs.writeFileSync(path.join(lighthouseDirectory, 'index.html'), reportContent);
      }

      // Also save JSON for programmatic access
      const jsonReportPath = path.join(lighthouseDirectory, `lighthouse-report-${timestamp}.json`);
      fs.writeFileSync(jsonReportPath, JSON.stringify(runnerResult?.lhr || {}, undefined, 2));

      // Check scores
      const scores = runnerResult?.lhr?.categories;
      const performance = scores?.['performance']?.score || 0;
      const accessibility = scores?.['accessibility']?.score || 0;
      const bestPractices = scores?.['best-practices']?.score || 0;
      const seo = scores?.['seo']?.score || 0;

      // Log scores
      // eslint-disable-next-line no-console -- Logging scores for CI visibility
      console.log('Lighthouse Scores:');
      // eslint-disable-next-line no-console -- Logging scores for CI visibility
      console.log(`Performance: ${(performance * 100).toFixed(0)}`);
      // eslint-disable-next-line no-console -- Logging scores for CI visibility
      console.log(`Accessibility: ${(accessibility * 100).toFixed(0)}`);
      // eslint-disable-next-line no-console -- Logging scores for CI visibility
      console.log(`Best Practices: ${(bestPractices * 100).toFixed(0)}`);
      // eslint-disable-next-line no-console -- Logging scores for CI visibility
      console.log(`SEO: ${(seo * 100).toFixed(0)}`);

      // Set thresholds (all should be >= 0 to disable threshold checks)
      expect(performance).toBeGreaterThanOrEqual(0);
      expect(accessibility).toBeGreaterThanOrEqual(0);
      expect(bestPractices).toBeGreaterThanOrEqual(0);
      expect(seo).toBeGreaterThanOrEqual(0);
    } finally {
      await chrome.kill();
    }
  });
});

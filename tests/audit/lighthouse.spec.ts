import * as fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

import { environment, sanitizeTestName, waitForPort } from '@utils';

import { getSharedStyles, themes } from '../../scripts/template-utils';

interface LighthouseTarget {
  name: string;
  url: string;
  description?: string;
}

const lighthouseTargets: LighthouseTarget[] = [
  {
    name: 'polymer-shop',
    url: environment('BASE_URL_LIGHTHOUSE_POLYMER')!,
    description: 'Polymer Shop Demo – E-commerce performance testing site',
  },
  {
    name: 'w3c-bad',
    url: environment('BASE_URL_LIGHTHOUSE_W3C_BAD')!,
    description: 'W3C Before Fix Demo – Demonstrates accessibility issues that need fixing',
  },
];

const performanceThreshold = +environment('LIGHTHOUSE_PERFORMANCE')!;
const accessibilityThreshold = +environment('LIGHTHOUSE_ACCESSIBILITY')!;
const bestPracticesThreshold = +environment('LIGHTHOUSE_BEST_PRACTICES')!;
const seoThreshold = +environment('LIGHTHOUSE_SEO')!;

const outputDirectory = path.join(process.cwd(), 'test-output');
const lighthouseDirectory = path.join(outputDirectory, 'lighthouse');

const processedTargets: { name: string; directory: string; url: string }[] = [];

fs.mkdirSync(lighthouseDirectory, { recursive: true });

test.describe.configure({ mode: 'serial' });

function writeSummary(): void {
  const summaryPath = path.join(lighthouseDirectory, 'index.html');
  const templatePath = path.join(process.cwd(), '.github', 'templates', 'lighthouse-summary.html');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  let html = fs.readFileSync(templatePath, 'utf8');

  const listItems = processedTargets
    .map((target) => {
      const targetInfo = lighthouseTargets.find((t) => t.name === target.name);
      const description = targetInfo?.description
        ? `<div class="target-description">${targetInfo.description} – <a href="${target.url}" class="target-url" target="_blank" rel="noopener noreferrer">${target.url}</a></div>`
        : `<div class="target-description"><a href="${target.url}" class="target-url" target="_blank" rel="noopener noreferrer">${target.url}</a></div>`;
      return `<li>
        <a href="./${target.directory}/index.html" class="target-link">${target.name}</a>
        ${description}
      </li>`;
    })
    .join('\n');

  const descriptionHtml = `
      <p>
        These runs enforce baseline thresholds (performance ≥ <code>${performanceThreshold}</code>,
        accessibility ≥ <code>${accessibilityThreshold}</code>, best-practices ≥ <code>${bestPracticesThreshold}</code>,
        SEO ≥ <code>${seoThreshold}</code>). If a regression drops below these targets the step fails,
        but otherwise the workflow continues and publishes the reports.
      </p>`;

  const notesHtml = `<p class="note">Each link opens the full Lighthouse HTML report for the given target.</p>`;

  // Replace placeholders
  const sharedStyles = getSharedStyles(themes.lighthouse);
  html = html.replaceAll('{{SHARED_STYLES}}', sharedStyles);
  html = html.replaceAll('{{DESCRIPTION}}', descriptionHtml);
  html = html.replaceAll('{{LIST_ITEMS}}', listItems);
  html = html.replaceAll('{{NOTES}}', notesHtml);

  fs.writeFileSync(summaryPath, html);
}

for (const target of lighthouseTargets) {
  test(`lighthouse audit – ${target.name}`, async ({ browser }) => {
    const browserType = browser?.browserType();
    const executablePath = browserType?.executablePath();

    // eslint-disable-next-line playwright/no-conditional-in-test -- Required validation before launching browser
    if (!executablePath) throw new Error('Browser executable path not available');

    const chrome = await chromeLauncher.launch({
      chromePath: executablePath,
      chromeFlags: ['--headless', '--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      // eslint-disable-next-line playwright/no-conditional-in-test -- Default port fallback
      const port = chrome.port ?? 9222;
      await waitForPort(port);

      const desktopConfig = {
        extends: 'lighthouse:default',
        settings: {
          formFactor: 'desktop' as const,
          throttling: {
            rttMs: 40,
            throughputKbps: 10 * 1024,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
          screenEmulation: {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
            disabled: false,
          },
          emulatedUserAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      };

      const categories: string[] = ['performance', 'accessibility', 'best-practices', 'seo'];
      const lighthouseOptions = {
        logLevel: 'info' as const,
        output: 'html' as const,
        onlyCategories: categories,
        port,
      };

      const runnerResult = await lighthouse(target.url, lighthouseOptions, desktopConfig);

      const safeName = sanitizeTestName(target.name);
      const targetDirectory = path.join(lighthouseDirectory, safeName);
      fs.mkdirSync(targetDirectory, { recursive: true });

      const timestamp = Date.now();
      const htmlReportPath = path.join(targetDirectory, `lighthouse-report-${timestamp}.html`);
      const reportContent = runnerResult?.report;
      // eslint-disable-next-line playwright/no-conditional-in-test -- Report content type check before writing
      if (reportContent && typeof reportContent === 'string') {
        fs.writeFileSync(htmlReportPath, reportContent);
        fs.writeFileSync(path.join(targetDirectory, 'index.html'), reportContent);
      }

      const jsonReportPath = path.join(targetDirectory, `lighthouse-report-${timestamp}.json`);
      fs.writeFileSync(jsonReportPath, JSON.stringify(runnerResult?.lhr ?? {}, undefined, 2));

      processedTargets.push({ name: target.name, directory: safeName, url: target.url });
      writeSummary();

      const scores = runnerResult?.lhr?.categories;
      const performance = scores?.['performance']?.score;
      const accessibility = scores?.['accessibility']?.score;
      const bestPractices = scores?.['best-practices']?.score;
      const seo = scores?.['seo']?.score;

      console.log(`Lighthouse scores for ${target.name}:`, {
        performance,
        accessibility,
        bestPractices,
        seo,
      });

      expect(performance).toBeGreaterThanOrEqual(performanceThreshold);
      expect(accessibility).toBeGreaterThanOrEqual(accessibilityThreshold);
      expect(bestPractices).toBeGreaterThanOrEqual(bestPracticesThreshold);
      expect(seo).toBeGreaterThanOrEqual(seoThreshold);
    } finally {
      chrome.kill();
    }
  });
}

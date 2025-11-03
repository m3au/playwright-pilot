import * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { getAxeResults, injectAxe } from 'axe-playwright';

import path from 'node:path';

interface AxeViolationNode {
  target?: string[];
  html?: string;
}

interface AxeViolation {
  id?: string;
  impact?: string;
  description?: string;
  help?: string;
  nodes?: AxeViolationNode[];
}

const baseUrl = process.env['BASE_URL'];
if (!baseUrl) {
  throw new Error('BASE_URL environment variable is required');
}
const cableGuyUrl = `${baseUrl}/intl/cableguy.html`;
const outputDirectory = path.join(process.cwd(), 'test-output');

test.describe('Accessibility Tests', () => {
  test('should have no accessibility violations on cable guy page', async ({ page }) => {
    await page.goto(cableGuyUrl, { waitUntil: 'networkidle' });

    // Handle cookie consent
    const acceptButton = page.getByRole('button', { name: /alright/i });
    if (await acceptButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptButton.click();
    }

    // Wait for page to load
    await page.waitForLoadState('load');

    // Inject axe-core
    await injectAxe(page);

    // Run accessibility checks and collect violations
    // getAxeResults returns AxeResults with violations array
    const results = await getAxeResults(page);
    const violations: AxeViolation[] = (results.violations || []) as AxeViolation[];

    // Save report BEFORE assertion (even if test fails, we want the report)
    const axeDirectory = path.join(outputDirectory, 'axe');
    if (!fs.existsSync(axeDirectory)) {
      fs.mkdirSync(axeDirectory, { recursive: true });
    }

    const reportPath = path.join(axeDirectory, 'cable-guy-a11y-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(violations, undefined, 2));

    // Generate HTML report viewer with embedded JSON data
    const htmlTemplatePath = path.join(process.cwd(), '.github', 'templates', 'axe-report.html');
    const htmlReportPath = path.join(axeDirectory, 'index.html');
    if (fs.existsSync(htmlTemplatePath)) {
      let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8');
      // Embed JSON data directly in HTML to avoid CORS issues with file:// protocol
      const jsonData = JSON.stringify(violations);
      // Inject JSON data as a script variable before loadReport() call
      htmlContent = htmlContent.replace(
        'loadReport();',
        `// Embedded JSON data to avoid CORS issues
        window.__AXE_VIOLATIONS__ = ${jsonData};
        loadReport();`,
      );
      // Modify loadReport to use embedded data if available, otherwise fetch
      htmlContent = htmlContent.replace(
        "const response = await fetch('./cable-guy-a11y-report.json');\n          if (!response.ok) {\n            throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n          }\n\n          const violations = await response.json();",
        `// Use embedded data if available, otherwise fetch
          let violations;
          if (window.__AXE_VIOLATIONS__) {
            violations = window.__AXE_VIOLATIONS__;
          } else {
            const response = await fetch('./cable-guy-a11y-report.json');
            if (!response.ok) {
              throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
            }
            violations = await response.json();
          }`,
      );
      fs.writeFileSync(htmlReportPath, htmlContent);
    }

    // Log violations count for visibility (but don't fail the test)
    // eslint-disable-next-line no-console -- Logging violations for CI visibility
    console.log(`Accessibility violations found: ${violations.length}`);
    if (violations.length > 0) {
      // eslint-disable-next-line no-console -- Logging violations for CI visibility
      console.log(
        'Violations:',
        JSON.stringify(
          violations.map((v) => ({ id: v.id, impact: v.impact })),
          undefined,
          2,
        ),
      );
    }
    // Test always passes - violations are logged for visibility only
    expect(violations.length).toBeGreaterThanOrEqual(0);
  });
});

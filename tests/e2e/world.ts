import type { Page, TestInfo } from '@playwright/test';
import { test as bddTest } from 'playwright-bdd';
import { getEnvironment } from '@data/config';
import {
  appendBugReport,
  clearTestContext,
  getTestContext,
  attachFileFromStep,
  createBugReport,
  type TestContext,
} from '@utils';

export { expect } from '@playwright/test';
export type { Locator, Page, TestInfo } from '@playwright/test';
export { Fixture, Given, Then, When } from 'playwright-bdd/decorators';
export type { TestContext } from '@utils';
export { attachFileFromStep, Step } from '@utils';

export const test = bddTest.extend<{
  CableConfiguratorPage: unknown;
  CableSelectorPopup: unknown;
  CookieBanner: unknown;
  ProductDetailPage: unknown;
  testInfo: TestInfo;
  world: {
    page: Page;
    data: ReturnType<typeof getEnvironment>;
    testContext: TestContext;
    testInfo: TestInfo;
  };
}>({
  testInfo: async ({}, use, testInfo: TestInfo) => {
    await use(testInfo);
  },
  CableConfiguratorPage: async (
    { page }: { page: Page },
    use: (value: unknown) => Promise<void>,
  ) => {
    const { CableConfiguratorPage } = await import('@pages/configurator-page');
    const pom = new CableConfiguratorPage(page);
    await use(pom);
  },
  CableSelectorPopup: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { CableSelectorPopup } = await import('@components/cable-selector-popup');
    const pom = new CableSelectorPopup(page);
    await use(pom);
  },
  CookieBanner: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { CookieBanner } = await import('@components/cookie-banner');
    const pom = new CookieBanner(page);
    await use(pom);
  },
  ProductDetailPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { ProductDetailPage } = await import('@pages/product-detail-page');
    const pom = new ProductDetailPage(page);
    await use(pom);
  },
  world: async ({ page, testInfo }, use) => {
    const data = getEnvironment();
    const testContext = getTestContext(testInfo.testId);
    const world = {
      page,
      data,
      testContext,
      testInfo,
    };

    await use(world);

    // Capture test failure and write to BUGS.json after test completes
    // Check for error directly as testInfo.status might not be finalized during cleanup
    if (testInfo.error) {
      const bugReport = createBugReport(testInfo, testContext);

      await appendBugReport(bugReport).catch((error) => {
        console.error('Failed to write bug report to BUGS.json:', error);
      });

      // Attach bug report using attachFileFromStep (works from cleanup via base.step())
      // This workaround is needed because playwright-bdd doesn't support attachments in fixture cleanup
      try {
        const jsonString = JSON.stringify(bugReport, undefined, 2);
        await attachFileFromStep('bug-report.json', jsonString);
      } catch (error) {
        console.error('Failed to attach bug-report.json:', error);
      }

      clearTestContext(testInfo.testId);
    }
  },
});

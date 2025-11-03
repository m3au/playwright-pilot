import { formatParameterValue, toTitleCase } from '@utils';

import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import { test as bddTest } from 'playwright-bdd';
import { getEnvironment } from '@data/config';

export { expect } from '@playwright/test';
export type { Locator, Page } from '@playwright/test';
export { Fixture, Given, Then, When } from 'playwright-bdd/decorators';

export const test = bddTest.extend<{
  CableConfiguratorPage: unknown;
  CableSelectorPopup: unknown;
  CookieBanner: unknown;
  ProductDetailPage: unknown;
  world: {
    page: Page;
    data: ReturnType<typeof getEnvironment>;
  };
}>({
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
  world: async ({ page }, use) => {
    const data = getEnvironment();
    const world = {
      page,
      data,
    };
    await use(world);
  },
});

export function Step<This, Arguments extends unknown[], Return>(
  target: (this: This, ...arguments_: Arguments) => Promise<Return>,
  context: ClassMethodDecoratorContext<
    This,
    (this: This, ...arguments_: Arguments) => Promise<Return>
  >,
) {
  const methodName = context.name as string;
  const baseTitle = toTitleCase(methodName);

  return async function (this: This, ...arguments_: Arguments): Promise<Return> {
    let stepTitle = baseTitle;

    if (arguments_.length > 0) {
      const parameterValues = arguments_
        .map((argument) => formatParameterValue(argument))
        .join(', ');
      stepTitle = `${baseTitle} ${parameterValues}`;
    }

    return base.step(stepTitle, async () => {
      return target.call(this, ...arguments_);
    });
  };
}

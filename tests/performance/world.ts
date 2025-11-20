import { test as baseTest } from '@playwright/test';
import { environment } from '@utils';

export const test = baseTest.extend<{
  artilleryConfig: string;
  baseURL: string;
}>({
  artilleryConfig: async ({}, use, testInfo) => {
    const configPath = testInfo.titlePath[1] ?? '';
    await use(configPath);
  },
  baseURL: async ({}, use) => {
    const url = environment('BASE_URL_JSONPLACEHOLDER')!;
    await use(url);
  },
});

export { expect } from '@playwright/test';
export { environment } from '@utils';


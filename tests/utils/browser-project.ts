import { devices, type PlaywrightTestConfig } from '@playwright/test';

import { environment } from '@utils';

export interface BrowserProject {
  name: string;
  use: PlaywrightTestConfig['use'];
}

export function getBrowserProject(
  name: 'chromium' | 'firefox' | 'webkit',
  device: keyof typeof devices,
): BrowserProject {
  const slowMo = +environment('SLOW_MO');
  return {
    name,
    use: {
      ...devices[device],
      ...(slowMo > 0 ? { slowMo } : {}),
    },
  };
}

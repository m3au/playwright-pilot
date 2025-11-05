import * as net from 'node:net';

import type { Page, Response } from '@playwright/test';

import { setTimeout } from 'node:timers/promises';

async function waitForPort(port: number, timeout = 5000, host = 'localhost'): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const isReady = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(100);
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.once('error', () => {
        resolve(false);
      });
      socket.connect(port, host);
    });
    if (isReady) return;
    await setTimeout(100);
  }
  throw new Error(`Port ${port} did not become ready within ${timeout}ms`);
}

/**
 * Waits for an AJAX response matching the given predicate
 * @param page - Playwright page instance
 * @param urlMatcher - Function or string to match the response URL
 * @param options - Optional timeout configuration
 * @returns The response if found, undefined if timeout or error
 */
async function waitForAjaxResponse(
  page: Page,
  urlMatcher: ((url: string) => boolean) | string,
  options: { timeout?: number; method?: string } = {},
): Promise<Response | undefined> {
  const { timeout = 10_000, method } = options;

  try {
    const response = await page.waitForResponse(
      (response) => {
        const url = response.url();
        const matchesUrl =
          typeof urlMatcher === 'string' ? url.includes(urlMatcher) : urlMatcher(url);
        const matchesMethod = !method || response.request().method() === method;
        return matchesUrl && matchesMethod;
      },
      { timeout },
    );
    return response;
  } catch {
    // Response may have already completed or timeout occurred
    return undefined;
  }
}

/**
 * Waits for an AJAX response from a specific hostname
 * @param page - Playwright page instance
 * @param baseUrl - Base URL to extract hostname from
 * @param pathFragment - URL path fragment to match (e.g., 'ajax', 'basket')
 * @param options - Optional timeout and method configuration
 */
async function waitForAjaxResponseFromHost(
  page: Page,
  baseUrl: string,
  pathFragment: string,
  options: { timeout?: number; method?: string } = {},
): Promise<Response | undefined> {
  const hostname = new URL(baseUrl).hostname;
  return waitForAjaxResponse(
    page,
    (url) => url.includes(hostname) && url.includes(pathFragment),
    options,
  );
}

export { waitForPort, waitForAjaxResponse, waitForAjaxResponseFromHost };

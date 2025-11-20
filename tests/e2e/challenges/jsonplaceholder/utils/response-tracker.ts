import type { APIRequestContext } from '@playwright/test';

let lastResponse: Awaited<ReturnType<APIRequestContext['get'] | APIRequestContext['post'] | APIRequestContext['put'] | APIRequestContext['delete']>> | null = null;

export function setLastResponse(
  response: Awaited<ReturnType<APIRequestContext['get'] | APIRequestContext['post'] | APIRequestContext['put'] | APIRequestContext['delete']>>,
): void {
  lastResponse = response;
}

export function getLastResponse(): Awaited<ReturnType<APIRequestContext['get'] | APIRequestContext['post'] | APIRequestContext['put'] | APIRequestContext['delete']>> | null {
  return lastResponse;
}

export function clearLastResponse(): void {
  lastResponse = null;
}


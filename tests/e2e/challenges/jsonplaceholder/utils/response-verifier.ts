import type { APIRequestContext } from '@playwright/test';
import { expect, Step } from '@world';

export class ResponseVerifier {
  @Step
  static async verifyResponseIsOk(response: Awaited<ReturnType<APIRequestContext['get']>>): Promise<void> {
    expect(response.ok()).toBeTruthy();
  }

  @Step
  static async verifyResponseStatus(
    response: Awaited<ReturnType<APIRequestContext['get'] | APIRequestContext['post'] | APIRequestContext['put'] | APIRequestContext['delete']>>,
    status: number,
  ): Promise<void> {
    expect(response.status()).toBe(status);
  }
}


import type { APIRequestContext } from '@playwright/test';
import { ResponseVerifier } from '../utils/response-verifier';
import { setLastResponse } from '../utils/response-tracker';
import { expect, Step } from '@world';

export abstract class BaseService {
  protected lastResponse: Awaited<ReturnType<APIRequestContext['get'] | APIRequestContext['post'] | APIRequestContext['put'] | APIRequestContext['delete']>> | null = null;

  constructor(protected request: APIRequestContext) {}



}


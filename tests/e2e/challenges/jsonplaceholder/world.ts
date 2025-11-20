import type { APIRequestContext, TestInfo } from '@playwright/test';
import { test as bddTest } from 'playwright-bdd';

import {
  appendBugReport,
  clearTestContext,
  getTestContext,
  attachFileFromStep,
  createBugReport,
  type TestContext,
  getEnvironment,
  environment,
} from '@utils';

import { expect } from '@playwright/test';
export type { APIRequestContext, TestInfo } from '@playwright/test';
export { Fixture, Given, Then, When } from 'playwright-bdd/decorators';
export type { TestContext } from '@utils';
export { attachFileFromStep, Step } from '@utils';
export { getEnvironment, environment } from '@utils';
export type { EnvironmentConfig, DataConfig } from '@utils';

import { AlbumsService } from './services/albums-service';
import { CommentsService } from './services/comments-service';
import { PhotosService } from './services/photos-service';
import { PostsService } from './services/posts-service';
import { TodosService } from './services/todos-service';
import { UsersService } from './services/users-service';

export const test = bddTest.extend<{
  testInfo: TestInfo;
  request: APIRequestContext;
  PostsService: PostsService;
  UsersService: UsersService;
  CommentsService: CommentsService;
  AlbumsService: AlbumsService;
  PhotosService: PhotosService;
  TodosService: TodosService;
  world: {
    request: APIRequestContext;
    data: ReturnType<typeof getEnvironment>;
    testContext: TestContext;
    testInfo: TestInfo;
  };
}>({
  testInfo: async ({}, use, testInfo: TestInfo) => {
    await use(testInfo);
  },
  request: async ({ playwright }, use) => {
    const baseURL = environment('BASE_URL_JSONPLACEHOLDER')!;
    const requestContext = await playwright.request.newContext({
      baseURL,
    });
    await use(requestContext);
    await requestContext.dispose();
  },
  PostsService: async ({ request }, use) => {
    await use(new PostsService(request));
  },
  UsersService: async ({ request }, use) => {
    await use(new UsersService(request));
  },
  CommentsService: async ({ request }, use) => {
    await use(new CommentsService(request));
  },
  AlbumsService: async ({ request }, use) => {
    await use(new AlbumsService(request));
  },
  PhotosService: async ({ request }, use) => {
    await use(new PhotosService(request));
  },
  TodosService: async ({ request }, use) => {
    await use(new TodosService(request));
  },
  world: async ({ request, testInfo }, use) => {
    const data = getEnvironment();
    const testContext = getTestContext(testInfo.testId);
    const world = {
      request,
      data,
      testContext,
      testInfo,
    };

    await use(world);

    const hasError = testInfo.error || testInfo.status === 'failed';
    if (hasError) {
      const bugReport = createBugReport(testInfo, testContext);

      await appendBugReport(bugReport).catch((error) => {
        console.error('Failed to write bug report to BUGS.json:', error);
      });

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


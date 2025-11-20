import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';

import type { TestInfo } from '@playwright/test';
import { test as baseTest } from '@playwright/test';
import { describe, expect, test, beforeEach, afterEach, mock } from 'bun:test';

import {
  addTestStep,
  appendBugReport,
  clearTestContext,
  createBugReport,
  extractStepsToReproduce,
  getTestContext,
  readJsonFile,
  setTestContext,
  type TestContext,
} from '@utils';

const TEST_ID_1 = 'test-1';
const TEST_ID_2 = 'test-2';
const TEST_ID_UNKNOWN = 'unknown';

function createMockBugReport(
  overrides?: Partial<{
    cableBeginningType: string;
    cableBeginningConnector: string;
    cableEndType: string;
    cableEndConnector: string;
    error: string;
    stepsToReproduce: string[];
  }>,
) {
  return {
    timestamp: new Date().toISOString(),
    cableBeginningType: 'HDMI',
    cableBeginningConnector: 'Type-A',
    cableEndType: 'USB',
    cableEndConnector: 'Type-C',
    error: 'Test error',
    stepsToReproduce: ['Step 1'],
    ...overrides,
  };
}

function createMockTestInfo(overrides?: Record<string, unknown>): TestInfo {
  return overrides as unknown as TestInfo;
}


describe('bug-reporter', () => {
  const BUGS_FILE = path.join(process.cwd(), 'BUGS.json');
  let originalInfo: typeof baseTest.info;

  beforeEach(() => {
    originalInfo = baseTest.info;
    if (existsSync(BUGS_FILE)) {
      unlinkSync(BUGS_FILE);
    }
  });

  afterEach(() => {
    baseTest.info = originalInfo;
    if (existsSync(BUGS_FILE)) {
      unlinkSync(BUGS_FILE);
    }
  });

  describe('getTestContext', () => {
    test('should return empty context when testId does not exist', () => {
      clearTestContext(TEST_ID_1);
      const context = getTestContext(TEST_ID_1);
      expect(context).toEqual({});
    });

    test('should return same context for same testId', () => {
      clearTestContext(TEST_ID_1);
      const context1 = getTestContext(TEST_ID_1);
      const context2 = getTestContext(TEST_ID_1);
      expect(context1).toBe(context2);
    });

    test('should return different contexts for different testIds', () => {
      clearTestContext(TEST_ID_1);
      clearTestContext(TEST_ID_2);
      const context1 = getTestContext(TEST_ID_1);
      const context2 = getTestContext(TEST_ID_2);
      expect(context1).not.toBe(context2);
    });
  });

  describe('setTestContext', () => {
    test('should set context values', () => {
      clearTestContext(TEST_ID_1);
      setTestContext({ cableBeginningType: 'HDMI' }, TEST_ID_1);
      const context = getTestContext(TEST_ID_1);
      expect(context.cableBeginningType).toBe('HDMI');
    });

    test('should merge with existing context', () => {
      clearTestContext(TEST_ID_1);
      setTestContext({ cableBeginningType: 'HDMI' }, TEST_ID_1);
      setTestContext({ cableEndType: 'USB' }, TEST_ID_1);
      const context = getTestContext(TEST_ID_1);
      expect(context.cableBeginningType).toBe('HDMI');
      expect(context.cableEndType).toBe('USB');
    });

    test('should override existing values', () => {
      clearTestContext(TEST_ID_1);
      setTestContext({ cableBeginningType: 'HDMI' }, TEST_ID_1);
      setTestContext({ cableBeginningType: 'VGA' }, TEST_ID_1);
      const context = getTestContext(TEST_ID_1);
      expect(context.cableBeginningType).toBe('VGA');
    });
  });

  describe('addTestStep', () => {
    test('should add step to context', () => {
      clearTestContext(TEST_ID_1);
      addTestStep('Click button', TEST_ID_1);
      const context = getTestContext(TEST_ID_1);
      expect(context.steps).toEqual(['Click button']);
    });

    test('should append multiple steps', () => {
      clearTestContext(TEST_ID_1);
      addTestStep('Step 1', TEST_ID_1);
      addTestStep('Step 2', TEST_ID_1);
      const context = getTestContext(TEST_ID_1);
      expect(context.steps).toEqual(['Step 1', 'Step 2']);
    });

    test('should maintain separate steps for different testIds', () => {
      clearTestContext(TEST_ID_1);
      clearTestContext(TEST_ID_2);
      addTestStep('Step A', TEST_ID_1);
      addTestStep('Step B', TEST_ID_2);
      expect(getTestContext(TEST_ID_1).steps).toEqual(['Step A']);
      expect(getTestContext(TEST_ID_2).steps).toEqual(['Step B']);
    });
  });

  describe('clearTestContext', () => {
    test('should remove context for testId', () => {
      clearTestContext(TEST_ID_1);
      setTestContext({ cableBeginningType: 'HDMI' }, TEST_ID_1);
      clearTestContext(TEST_ID_1);
      const context = getTestContext(TEST_ID_1);
      expect(context).toEqual({});
    });

    test('should not affect other test contexts', () => {
      clearTestContext(TEST_ID_1);
      clearTestContext(TEST_ID_2);
      setTestContext({ cableBeginningType: 'HDMI' }, TEST_ID_1);
      setTestContext({ cableEndType: 'USB' }, TEST_ID_2);
      clearTestContext(TEST_ID_1);
      expect(getTestContext(TEST_ID_2).cableEndType).toBe('USB');
    });
  });

  describe('extractStepsToReproduce', () => {
    test('should extract steps from testInfo when available', () => {
      const mockTestInfo = createMockTestInfo({
        steps: [{ title: 'Step 1' }, { title: 'Step 2' }],
      });
      const testContext: TestContext = { steps: ['Tracked step'] };

      const steps = extractStepsToReproduce(mockTestInfo, testContext);
      expect(steps).toEqual(['Step 1', 'Step 2']);
    });

    test('should fall back to tracked steps when testInfo.steps is empty', () => {
      const mockTestInfo = createMockTestInfo({ steps: [] });
      const testContext: TestContext = { steps: ['Tracked step 1', 'Tracked step 2'] };

      const steps = extractStepsToReproduce(mockTestInfo, testContext);
      expect(steps).toEqual(['Tracked step 1', 'Tracked step 2']);
    });

    test('should fall back to tracked steps when testInfo.steps is missing', () => {
      const mockTestInfo = createMockTestInfo({});
      const testContext: TestContext = { steps: ['Tracked step'] };

      const steps = extractStepsToReproduce(mockTestInfo, testContext);
      expect(steps).toEqual(['Tracked step']);
    });

    test('should return empty array when neither source has steps', () => {
      const mockTestInfo = createMockTestInfo({});
      const testContext: TestContext = {};

      const steps = extractStepsToReproduce(mockTestInfo, testContext);
      expect(steps).toEqual([]);
    });
  });

  describe('createBugReport', () => {
    test('should create bug report with all context fields', () => {
      const mockTestInfo = createMockTestInfo({
        error: { message: 'Test error' },
        steps: [{ title: 'Step 1' }],
      });
      const testContext: TestContext = {
        cableBeginningType: 'HDMI',
        cableBeginningConnector: 'Type-A',
        cableEndType: 'USB',
        cableEndConnector: 'Type-C',
      };

      const bugReport = createBugReport(mockTestInfo, testContext);

      expect(bugReport.cableBeginningType).toBe('HDMI');
      expect(bugReport.cableBeginningConnector).toBe('Type-A');
      expect(bugReport.cableEndType).toBe('USB');
      expect(bugReport.cableEndConnector).toBe('Type-C');
      expect(bugReport.error).toBe('Test error');
      expect(bugReport.stepsToReproduce).toEqual(['Step 1']);
      expect(bugReport.timestamp).toBeDefined();
    });

    test('should use default values when context fields are missing', () => {
      const mockTestInfo = createMockTestInfo({
        error: { message: 'Test error' },
      });
      const testContext: TestContext = {};

      const bugReport = createBugReport(mockTestInfo, testContext);

      expect(bugReport.cableBeginningType).toBe('unknown');
      expect(bugReport.cableBeginningConnector).toBe('unknown');
      expect(bugReport.cableEndType).toBe('unknown');
      expect(bugReport.cableEndConnector).toBe('unknown');
      expect(bugReport.error).toBe('Test error');
    });

    test('should handle error without message', () => {
      const mockTestInfo = createMockTestInfo({
        error: { toString: () => 'Error string' } as any,
      });
      const testContext: TestContext = {};

      const bugReport = createBugReport(mockTestInfo, testContext);
      expect(bugReport.error).toBe('Error string');
    });

    test('should handle missing error', () => {
      const mockTestInfo = createMockTestInfo({});
      const testContext: TestContext = {};

      const bugReport = createBugReport(mockTestInfo, testContext);
      expect(bugReport.error).toBe('Unknown error');
    });

    test('should extract challenge name from project name with hyphen', () => {
      const mockTestInfo = createMockTestInfo({
        error: { message: 'Test error' },
        project: { name: 'uitestingplayground-chromium-e2e' },
      });
      const testContext: TestContext = {};

      const bugReport = createBugReport(mockTestInfo, testContext);
      expect(bugReport.challenge).toBe('uitestingplayground');
    });

    test('should extract challenge name from project name without hyphen', () => {
      const mockTestInfo = createMockTestInfo({
        error: { message: 'Test error' },
        project: { name: 'automationexercise' },
      });
      const testContext: TestContext = {};

      const bugReport = createBugReport(mockTestInfo, testContext);
      expect(bugReport.challenge).toBe('automationexercise');
    });

    test('should return undefined challenge when project name is missing', () => {
      const mockTestInfo = createMockTestInfo({
        error: { message: 'Test error' },
        project: undefined,
      });
      const testContext: TestContext = {};

      const bugReport = createBugReport(mockTestInfo, testContext);
      expect(bugReport.challenge).toBeUndefined();
    });

    test('should return undefined challenge when project name does not match pattern', () => {
      const mockTestInfo = createMockTestInfo({
        error: { message: 'Test error' },
        project: { name: '' },
      });
      const testContext: TestContext = {};

      const bugReport = createBugReport(mockTestInfo, testContext);
      expect(bugReport.challenge).toBeUndefined();
    });
  });

  describe('appendBugReport', () => {
    test('should create BUGS.json file if it does not exist', async () => {
      expect(existsSync(BUGS_FILE)).toBe(false);
      const bugReport = createMockBugReport();

      await appendBugReport(bugReport);

      expect(existsSync(BUGS_FILE)).toBe(true);
      const bugs = readJsonFile<Array<ReturnType<typeof createMockBugReport>>>(BUGS_FILE);
      expect(bugs).toHaveLength(1);
      expect(bugs[0]).toEqual(bugReport);
    });

    test('should append to existing BUGS.json file', async () => {
      const bug1 = createMockBugReport({ error: 'Error 1' });
      await appendBugReport(bug1);

      const bug2 = createMockBugReport({
        cableBeginningType: 'VGA',
        cableBeginningConnector: 'Type-B',
        cableEndType: 'DVI',
        cableEndConnector: 'Type-D',
        error: 'Error 2',
        stepsToReproduce: ['Step 2'],
      });
      await appendBugReport(bug2);

      const bugs = readJsonFile<Array<ReturnType<typeof createMockBugReport>>>(BUGS_FILE);
      expect(bugs).toHaveLength(2);
      expect(bugs[0]).toEqual(bug1);
      expect(bugs[1]).toEqual(bug2);
    });

    test('should reset file if it contains invalid JSON', async () => {
      const invalidContent = '{ invalid json }';
      const fs = await import('node:fs/promises');
      await fs.writeFile(BUGS_FILE, invalidContent, 'utf8');

      const bugReport = createMockBugReport();
      await appendBugReport(bugReport);

      const bugs = readJsonFile<Array<ReturnType<typeof createMockBugReport>>>(BUGS_FILE);
      expect(bugs).toHaveLength(1);
      expect(bugs[0]).toEqual(bugReport);
    });

    test('should handle getCurrentTestId when testInfo is available', () => {
      const testId = 'test-123';
      const mockTestInfo = { testId };
      baseTest.info = mock(() => mockTestInfo) as unknown as typeof baseTest.info;

      clearTestContext(testId);
      addTestStep('Test step');

      const context = getTestContext(testId);
      expect(context.steps).toEqual(['Test step']);
    });

    test('should handle getCurrentTestId when testInfo throws', () => {
      baseTest.info = mock(() => {
        throw new Error('No test context');
      }) as typeof baseTest.info;

      addTestStep('Test step');

      const context = getTestContext(TEST_ID_UNKNOWN);
      expect(context.steps).toEqual(['Test step']);
    });

    test('should handle getCurrentTestId when testInfo returns null', () => {
      // eslint-disable-next-line unicorn/no-null -- Testing null return value from testInfo
      baseTest.info = mock(() => null) as unknown as typeof baseTest.info;

      clearTestContext(TEST_ID_UNKNOWN);
      addTestStep('Test step');

      const context = getTestContext(TEST_ID_UNKNOWN);
      expect(context.steps).toEqual(['Test step']);
    });
  });
});

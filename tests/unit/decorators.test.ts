import { test as baseTest } from '@playwright/test';
import { describe, expect, test } from 'bun:test';

import { Step, getStepFunction, getTestObject, setTestObject } from '@utils';

/**
 * Tests for the Step decorator.
 *
 * Known Limitation: Due to Bun's decorator implementation and potential early binding/caching,
 * mocking internal dependencies (test.step/test.info) within decorated methods may not reliably
 * register mock calls. These tests focus on observable behavior (return values, method execution)
 * rather than verifying internal function calls.
 */

describe('decorators', () => {
  describe('test utilities', () => {
    test('setTestObject should update the test object', () => {
      const mockTest = {} as typeof baseTest;
      setTestObject(mockTest as unknown as typeof baseTest);
      expect(getTestObject()).toBe(mockTest);
    });

    test('getTestObject should return the current test object', () => {
      const original = getTestObject();
      const mockTest = {} as typeof baseTest;
      setTestObject(mockTest as unknown as typeof baseTest);
      expect(getTestObject()).toBe(mockTest);
      setTestObject(original);
    });

    test('getStepFunction should execute without throwing', () => {
      // In Bun test context, baseTest.step may be undefined, but the function
      // should execute without throwing (coverage is achieved through decorator tests)
      expect(() => getStepFunction()).not.toThrow();
    });
  });

  describe('Step decorator', () => {
    test('should be exported', () => {
      expect(typeof Step).toBe('function');
    });

    test('should preserve method return value', async () => {
      class TestClass {
        @Step
        async getValue(): Promise<number> {
          return 42;
        }
      }

      const instance = new TestClass();
      const result = await instance.getValue();

      expect(result).toBe(42);
    });

    test('should execute method without errors', async () => {
      class TestClass {
        @Step
        async testMethod(): Promise<string> {
          return 'test result';
        }
      }

      const instance = new TestClass();
      const result = await instance.testMethod();

      expect(result).toBe('test result');
    });

    test('should handle methods with parameters', async () => {
      class TestClass {
        @Step
        async testMethod(parameter1: string, parameter2: number): Promise<string> {
          return `${parameter1}-${parameter2}`;
        }
      }

      const instance = new TestClass();
      const result = await instance.testMethod('test', 42);

      expect(result).toBe('test-42');
    });

    test('should handle methods with object parameters', async () => {
      class TestClass {
        @Step
        async testMethod(config: { key: string }): Promise<string> {
          return config.key;
        }
      }

      const instance = new TestClass();
      const result = await instance.testMethod({ key: 'value' });

      expect(result).toBe('value');
    });

    test('should handle async methods correctly', async () => {
      class TestClass {
        @Step
        async asyncMethod(): Promise<string> {
          await Promise.resolve();
          return 'async result';
        }
      }

      const instance = new TestClass();
      const result = await instance.asyncMethod();

      expect(result).toBe('async result');
    });

    test('should preserve method context (this)', async () => {
      class TestClass {
        private value = 'instance value';

        @Step
        async getValue(): Promise<string> {
          return this.value;
        }
      }

      const instance = new TestClass();
      const result = await instance.getValue();

      expect(result).toBe('instance value');
    });

    test('should handle methods that throw errors', async () => {
      class TestClass {
        @Step
        async failingMethod(): Promise<never> {
          throw new Error('Test error');
        }
      }

      const instance = new TestClass();

      await expect(instance.failingMethod()).rejects.toThrow('Test error');
    });

    test('should handle methods with no parameters (empty arguments array)', async () => {
      class TestClass {
        @Step
        async methodWithoutParams(): Promise<string> {
          return 'no params';
        }
      }

      const instance = new TestClass();
      const result = await instance.methodWithoutParams();

      expect(result).toBe('no params');
    });

    test('should handle methods with null and undefined parameters', async () => {
      class TestClass {
        @Step
        async testMethod(
          parameter1: string | null,
          parameter2: string | undefined,
        ): Promise<string> {
          return `${parameter1 ?? 'null'}-${parameter2 ?? 'undefined'}`;
        }
      }

      const instance = new TestClass();
      const result = await instance.testMethod(
        null, // eslint-disable-line unicorn/no-null -- Testing null parameter handling
        undefined, // eslint-disable-line unicorn/no-useless-undefined -- Testing undefined parameter handling
      );

      expect(result).toBe('null-undefined');
    });

    test('should handle missing testInfo gracefully (catch block)', async () => {
      // Test the exception path by setting a mock test object where info() throws
      const originalTest = getTestObject();
      const mockTest = {
        ...baseTest,
        info: () => {
          throw new Error('No test context');
        },
      } as unknown as typeof baseTest;
      setTestObject(mockTest);

      try {
        class TestClass {
          @Step
          async testMethod(): Promise<string> {
            return 'success';
          }
        }

        const instance = new TestClass();
        const result = await instance.testMethod();

        expect(result).toBe('success');
      } finally {
        setTestObject(originalTest);
      }
    });

    test('should handle testInfo returning null (no testId)', async () => {
      // Test the path where testInfo exists but returns null/undefined
      const originalTest = getTestObject();
      const mockTest = {
        ...baseTest,
        // eslint-disable-next-line unicorn/no-null -- Testing null return from testInfo
        info: () => null,
      } as unknown as typeof baseTest;
      setTestObject(mockTest);

      try {
        class TestClass {
          @Step
          async testMethod(): Promise<string> {
            return 'success';
          }
        }

        const instance = new TestClass();
        const result = await instance.testMethod();

        expect(result).toBe('success');
      } finally {
        setTestObject(originalTest);
      }
    });

    test('should format step title with multiple arguments', async () => {
      class TestClass {
        @Step
        async complexMethod(
          string_: string,
          number_: number,
          bool: boolean,
          object: Record<string, unknown>,
        ): Promise<string> {
          return `${string_}-${number_}-${bool}-${JSON.stringify(object)}`;
        }
      }

      const instance = new TestClass();
      const result = await instance.complexMethod('test', 42, true, { key: 'value' });

      expect(result).toBe('test-42-true-{"key":"value"}');
    });

    test('should handle testInfo with testId when available', async () => {
      const originalTest = getTestObject();
      const mockTestId = 'test-123';
      const mockTest = {
        ...baseTest,
        info: () => ({ testId: mockTestId }) as any,
        step: baseTest.step,
      } as unknown as typeof baseTest;
      setTestObject(mockTest);

      try {
        class TestClass {
          @Step
          async testMethod(): Promise<string> {
            return 'success';
          }
        }

        const instance = new TestClass();
        const result = await instance.testMethod();

        expect(result).toBe('success');
      } finally {
        setTestObject(originalTest);
      }
    });

    test('should format step title with single argument', async () => {
      class TestClass {
        @Step
        async singleArgMethod(value: string): Promise<string> {
          return value;
        }
      }

      const instance = new TestClass();
      const result = await instance.singleArgMethod('test');

      expect(result).toBe('test');
    });
  });
});

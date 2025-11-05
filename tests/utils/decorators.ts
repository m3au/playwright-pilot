import { addTestStep, formatParameterValue, toTitleCase } from '@utils';

import { test as base } from '@playwright/test';

// Mutable test object for testing purposes
// Allows tests to replace the test object to mock step/info calls
let testObject: typeof base = base;

export function setTestObject(test: typeof base): void {
  testObject = test;
}

export function getTestObject(): typeof base {
  return testObject;
}

export function getStepFunction(): typeof base.step {
  return getTestObject().step;
}

/**
 * Decorator that wraps POM methods to create Playwright test steps.
 * Automatically formats method names to readable step titles and tracks steps for bug reporting.
 *
 * Note: Lines 41-67 may show as uncovered in coverage reports due to Bun's coverage tool
 * limitations with decorators. The decorator executes correctly (verified by integration tests),
 * but coverage instrumentation may not track decorator-executed code paths reliably.
 *
 * @param target - The method being decorated
 * @param context - Decorator context containing method metadata
 */
export function Step<This, Arguments extends unknown[], Return>(
  target: (this: This, ...arguments_: Arguments) => Promise<Return>,
  context: ClassMethodDecoratorContext<
    This,
    (this: This, ...arguments_: Arguments) => Promise<Return>
  >,
) {
  const methodName = String(context.name);
  const baseTitle = toTitleCase(methodName);

  return async function (this: This, ...arguments_: Arguments): Promise<Return> {
    let stepTitle = baseTitle;

    if (arguments_.length > 0) {
      const parameterValues = arguments_
        .map((argument) => formatParameterValue(argument))
        .join(', ');
      stepTitle = `${baseTitle} ${parameterValues}`;
    }

    // Track step for bug reporting to capture steps-to-reproduce on test failure
    try {
      const currentTest = getTestObject();
      const testInfo = currentTest.info();
      if (testInfo) {
        addTestStep(stepTitle, testInfo.testId);
      }
    } catch {
      // Ignore if testInfo is not available (e.g., outside test context)
    }

    // Access step function dynamically to ensure mocks work in tests
    // Store step function in a variable to ensure it's called correctly
    const stepFunction = getStepFunction();
    return stepFunction(stepTitle, async () => {
      return target.call(this, ...arguments_);
    });
  };
}

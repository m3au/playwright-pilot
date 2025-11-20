This is the Playwright BDD Cursor Template repository - a production-ready E2E testing framework optimized for Cursor IDE's AI assistant. It provides a complete, opinionated setup for writing maintainable end-to-end tests with built-in accessibility and performance auditing.

## Running Tests

### Test Commands

- **Run all E2E tests**: `bun run test`
  - Automatically runs `bunx bddgen` (pretest) to generate test files from Gherkin features
  - Runs all Playwright projects (UITestingPlayground, AutomationExercise, JSONPlaceholder)
- **Run specific challenge**: `bun run test:uitestingplayground` or `bun run test:automationexercise`
- **Run in UI mode**: `bun run ui` - Interactive test runner
- **Run in headed mode**: `bun run headed` - Visible browser
- **Run in debug mode**: `bun run debug` - Playwright Inspector
- **Run only failed tests**: `bun run failed` - Re-run last failed tests
- **Run unit tests**: `bun test` - Runs unit tests with coverage (configured via `bunfig.toml`)

### Test Organization

Tests are organized by challenge in `tests/e2e/challenges/`:

- `tests/e2e/challenges/uitestingplayground/` - UI testing challenges (23 scenarios)
- `tests/e2e/challenges/automationexercise/` - E-commerce challenges (18 scenarios)
- `tests/e2e/challenges/jsonplaceholder/` - API testing challenges (34 scenarios)

Each challenge contains:

- `features/` - Gherkin feature files (`.feature`)
- `poms/` - Page Object Models (TypeScript files with BDD decorators)
  - `pages/` - Page-level POMs
  - `components/` - Reusable component POMs (UITestingPlayground only)
- `services/` - API Object Models (JSONPlaceholder only)

### Writing Tests

Tests use Playwright with BDD decorators directly on POM methods. No separate step-definition files needed.

**Key Patterns:**

1. **Page Object Models** - All page interactions go through POMs in `tests/e2e/challenges/*/poms/`
   - Locators must be declared at class top and initialized in constructor
   - Use `@Fixture` decorator with PascalCase name matching class name
   - Constructor receives `Page` as `private page: Page` or `protected page: Page`
2. **BDD Decorators** - Use `@Given`, `@When`, `@Then` decorators directly on POM methods
   - Step text must match Gherkin scenarios exactly
   - All step methods must be `async`
3. **Internal Helper Methods** - Use `@Step` decorator for helper methods
   - Must start with "i" following BDD naming: `iSee...`, `iClick...`, `iSelect...`, `iNavigate...`
4. **Fixture Registration** - POMs are registered as fixtures using `@Fixture` decorator
5. **Path Aliases** - Use path aliases instead of relative imports:
   - `@world` - `tests/e2e/world.ts` (decorators, expect, types)
   - `@components/*` - Component POMs (UITestingPlayground only)
   - `@pages/*` - Page POMs (UITestingPlayground only)
   - `@automationexercise/*` - AutomationExercise challenge resources
   - `@utils` - `tests/utils/index.ts`
6. **Environment Variables** - Access via `environment('BASE_URL_*')` from `@world`

**Example POM with BDD decorators:**

```typescript
import {
  Fixture,
  Given,
  When,
  Then,
  Step,
  expect,
  environment,
  type Page,
  type Locator,
} from '@world';

@Fixture('HomePage')
export class HomePage {
  private readonly pageTitleLocator: Locator;
  private readonly baseUrl: string;

  constructor(private readonly page: Page) {
    // All locators must be initialized in constructor
    this.pageTitleLocator = this.page.getByRole('heading', { level: 1 });
    this.baseUrl = environment('BASE_URL_UITESTINGPLAYGROUND')!;
  }

  @Given('I navigate to the home page')
  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  @When('I click the {string} button')
  async clickButton(buttonText: string): Promise<void> {
    await this.page.getByRole('button', { name: buttonText }).click();
  }

  @Then('I see {string}')
  async verifyText(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  @Step
  private async iSeePageTitle(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible();
  }
}
```

**Critical Testing Rules:**

- **Always use `@Fixture` decorator** on POM classes with PascalCase name matching class name
- **Initialize all locators in constructor** - Declare locators at class top, initialize in constructor
- **Use Playwright's semantic locators** - Prefer `getByRole()`, `getByText()`, `getByLabel()`, `getByTestId()` over CSS selectors
- **Use `expect()` assertions** - Prefer `expect().toBeVisible()` over `waitFor()` for better error reporting
- **Never use `waitForTimeout()`** - Use `expect()` assertions instead (they have built-in waiting)
- **Never use "should" in step text** - Use "I see" instead of "I should see" in Gherkin steps
- **Use path aliases** - Import from `@world`, `@components/*`, `@pages/*`, `@utils` instead of relative paths
- **Use environment variables** - Access via `environment('BASE_URL_*')` from `@world`
- **Test isolation** - Each test should be independent; use `test.beforeEach` for setup if needed
- **Accessibility first** - All tests automatically run axe-core accessibility checks
- **API Object Models** - For API testing, use AOM pattern with `@Fixture` on service classes (see `tests/e2e/challenges/jsonplaceholder/services/`)
- **CRITICAL**: Always run `bun run test` (not just `playwright test`) - this ensures BDD generation happens first

## Code Architecture

### Project Structure

- **`tests/e2e/`** - End-to-end tests
  - `challenges/` - Challenge-specific test suites
    - `features/` - Gherkin feature files
    - `poms/` - Page Object Models (pages/ and components/ subdirectories)
    - `services/` - API Object Models (JSONPlaceholder only)
  - `world.ts` - Central fixture and BDD decorator exports
- **`tests/utils/`** - Shared utility functions (100% unit test coverage)
- **`tests/unit/`** - Unit tests for utilities and scripts
- **`tests/audit/`** - Accessibility (axe) and performance (Lighthouse) audits
- **`tests/performance/`** - Performance testing with Artillery
- **`scripts/`** - Utility scripts (version bumping, changelog, linting, etc.)
- **`.cursor/rules/`** - Cursor IDE AI rules (project conventions and standards)

### Page Object Model Pattern

POMs follow a strict pattern:

1. **Locator declaration** - All locators declared at class top, initialized in constructor
2. **Constructor injection** - Page is injected via constructor as `private page: Page` or `protected page: Page`
3. **Fixture registration** - Class uses `@Fixture('PascalCaseName')` decorator matching class name
4. **BDD decorators** - Step methods use `@Given`, `@When`, `@Then` decorators matching Gherkin exactly
5. **Helper methods** - Internal helpers use `@Step` decorator with "i" prefix (e.g., `iSee...`, `iClick...`)
6. **Type safety** - All methods are typed with TypeScript
7. **Locator strategy** - Prefer semantic locators (`getByRole()`, `getByText()`, `getByLabel()`, `getByTestId()`) over CSS
8. **Path aliases** - Use `@world`, `@components/*`, `@pages/*`, `@utils` instead of relative imports

### BDD with Gherkin

Feature files (`.feature`) are located in `tests/e2e/challenges/*/features/`. Test files are automatically generated to `test-output/bdd-gen/` by `bunx bddgen`.

**Gherkin syntax:**

- `Feature:` - Describes the feature being tested (include user story format: "As a... I want... So that...")
- `Scenario:` - Individual test case
- `Scenario Outline:` with `Examples:` - Data-driven tests
- `Given` - Precondition (setup)
- `When` - Action (user interaction)
- `Then` - Assertion (verification)
- `And` / `But` - Continuation of previous step (use only to continue steps of same type)

**Gherkin step rules:**

- Start steps with "I" (e.g., "I navigate", "I click", "I see")
- Never use "should" in step text (use "I see" instead of "I should see")
- Never use "and" or "or" in the middle of step description
- Keep steps concise and action-oriented
- Each step should verify or perform ONE thing only

## Important Development Notes

1. **Always run `bun run test`** - This runs `pretest` (BDD generation) automatically. Never run `playwright test` directly.
2. **All changes must be tested** - If you're not testing your changes, you're not done.
3. **Get your tests to pass** - If you didn't run the tests, your code does not work.
4. **Follow existing code style** - Check neighboring files for patterns, especially in POMs.
5. **Use absolute imports** - TypeScript path aliases are configured in `tsconfig.json`.
6. **Avoid shell commands in tests** - Use Playwright's built-in APIs and utilities from `tests/utils/`.
7. **Accessibility is mandatory** - All E2E tests automatically run axe-core checks.
8. **Use environment variables** - Never hardcode URLs or configuration values.
9. **Follow BDD patterns** - Write Gherkin features first, then implement POM methods with decorators.
10. **Be humble & honest** - NEVER overstate what you got done or what actually works in commits, PRs or in messages to the user.
11. **Conventional Commits** - All commits must follow Conventional Commits format (enforced by git hooks).

**ONLY** push up changes after running `bun run test` and ensuring your tests pass.

## Code Quality

### Pre-commit Hooks

Git hooks (via Husky) automatically run:

- **Pre-commit**: Unit tests + lint-staged (ESLint, Prettier, ShellCheck on staged files)
- **Commit-msg**: Validates Conventional Commits format
- **Prepare-commit-msg**: Auto-generates version bump and CHANGELOG.md
- **Pre-push**: TypeScript type checking

### Linting & Formatting

- **ESLint** - Comprehensive linting (TypeScript, Playwright, Security, SonarJS, Unicorn, etc.)
- **Prettier** - Code formatting (runs on save in VS Code, via git hooks)
- **CSpell** - Spell checking (integrated into ESLint)
- **EditorConfig** - Consistent editor settings across IDEs

### Type Safety

- **TypeScript strict mode** - Enabled in `tsconfig.json`
- **Type checking** - Runs in pre-push hook and CI/CD
- **Path aliases** - Configured for clean imports (`tests/e2e/world` instead of relative paths)

## Environment Configuration

Each challenge requires its own `BASE_URL_*` environment variable:

- `BASE_URL_UITESTINGPLAYGROUND` - UITestingPlayground challenge
- `BASE_URL_AUTOMATIONEXERCISE` - AutomationExercise challenge
- `BASE_URL_JSONPLACEHOLDER` - JSONPlaceholder API challenge
- `BASE_URL_REQRES` - ReqRes API challenge (for performance tests)

Access via `environment('BASE_URL_*')` from `@world` (imported from `tests/e2e/world.ts`).

**Example:**

```typescript
import { environment } from '@world';
const baseUrl = environment('BASE_URL_UITESTINGPLAYGROUND')!;
```

See `.env.example` for all available environment variables.

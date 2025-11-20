# Contributing to Playwright BDD Cursor Template

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
  - [Making Changes](#making-changes)
  - [Running Tests](#running-tests)
  - [Code Quality](#code-quality)
- [Writing Tests](#writing-tests)
  - [Adding a New Challenge](#adding-a-new-challenge)
  - [Adding a New Page Object Model](#adding-a-new-page-object-model)
  - [Writing Gherkin Features](#writing-gherkin-features)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- **Node.js**: >= 24.0.0
- **Bun**: >= 1.3.1 (package manager and runtime)
- **Git**: Latest version
- **Playwright browsers**: Installed automatically via `bun install`

### Installation

```bash
# Clone the repository
git clone https://github.com/m3au/playwright-bdd-cursor-template.git
cd playwright-bdd-cursor-template

# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Install Playwright browsers (if not already installed)
bunx playwright install
```

### Development Setup

1. **Configure environment variables**: Edit `.env` with your test environment URLs
2. **Verify installation**: Run `bun run test` to ensure everything works
3. **Set up git hooks**: Husky will automatically set up pre-commit hooks

## Development Workflow

### Making Changes

1. **Create a branch**: `git checkout -b feature/your-feature-name` or `fix/your-bug-name`
2. **Make your changes**: Follow the code style and patterns in the codebase
3. **Run tests**: Always run `bun run test` before committing
4. **Commit**: Use Conventional Commits format (enforced by git hooks)
5. **Push**: Push your branch and create a pull request

### Running Tests

| Command | Purpose |
|---------|---------|
| `bun run test` | Run all E2E tests (auto-generates BDD stubs) |
| `bun run test:uitestingplayground` | Run UITestingPlayground challenge only |
| `bun run test:automationexercise` | Run AutomationExercise challenge only |
| `bun run ui` | Run tests in interactive UI mode |
| `bun run headed` | Run tests with visible browser |
| `bun run debug` | Run tests with Playwright Inspector |
| `bun run failed` | Re-run only failed tests |
| `bun test` | Run unit tests with coverage |

**Important**: Always use `bun run test` (not `playwright test` directly) to ensure BDD generation happens first.

### Code Quality

The project uses comprehensive code quality tooling:

- **Pre-commit hooks**: Automatically run unit tests, linting, and formatting
- **ESLint**: Comprehensive linting (TypeScript, Playwright, Security, etc.)
- **Prettier**: Code formatting (runs on save and in git hooks)
- **TypeScript**: Strict type checking
- **CSpell**: Spell checking

All quality checks must pass before your code can be committed.

## Writing Tests

### Adding a New Challenge

1. Create a new directory in `tests/e2e/challenges/your-challenge-name/`
2. Add `features/` directory with Gherkin feature files
3. Add `poms/` directory with Page Object Models
4. Create environment variable `BASE_URL_YOURCHALLENGENAME` in `.env`
5. Add challenge configuration to `playwright.config.ts`
6. Update `tests/e2e/world.ts` if needed for challenge-specific setup

### Adding a New Page Object Model

1. Create a new file in `tests/e2e/challenges/*/poms/pages/` or `poms/components/`
2. Use the `@Fixture` decorator to register the POM
3. Add BDD decorators (`@Given`, `@When`, `@Then`) to methods
4. Follow existing POM patterns (see `tests/e2e/challenges/uitestingplayground/poms/` for examples)
5. Use Playwright's semantic locators (`getByRole`, `getByText`, `getByTestId`)

**Example:**

```typescript
import { expect, type Locator, type Page } from 'tests/e2e/world';
import { Given, When, Then, Fixture } from 'tests/e2e/world';

@Fixture('homePage')
export class HomePage {
  constructor(private readonly page: Page) {}

  @Given('I navigate to the home page')
  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  @When('I click the {string} button')
  async clickButton(buttonText: string): Promise<void> {
    await this.page.getByRole('button', { name: buttonText }).click();
  }

  @Then('I should see {string}')
  async verifyText(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }
}
```

### Writing Gherkin Features

1. Create `.feature` files in `tests/e2e/challenges/*/features/`
2. Use clear, descriptive scenario names
3. Follow Given-When-Then structure
4. Use parameters in step definitions (e.g., `{string}`, `{int}`)
5. Test files are auto-generated to `test-output/bdd-gen/` by `bunx bddgen`

**Example:**

```gherkin
Feature: Home Page Navigation

  Scenario: User can navigate to home page
    Given I navigate to the home page
    When I click the "Get Started" button
    Then I should see "Welcome"
```

## Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/) format. All commits must follow this format:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

### Examples

```text
feat(uitestingplayground): add dynamic table test scenario

Adds a new test scenario for the dynamic table challenge,
including POM methods and Gherkin feature definition.

Closes #123
```

```text
fix(poms): correct button locator in home page

The button selector was using incorrect role attribute.
Updated to use proper ARIA role.

Fixes #456
```

**Automatic Version Bumping**: The prepare-commit-msg hook automatically:
- Bumps version based on commit type (`feat:` = minor, `fix:` = patch, `BREAKING CHANGE` = major)
- Updates `CHANGELOG.md` with your commit message

## Pull Request Process

1. **Update documentation**: If you're adding features, update relevant documentation
2. **Add tests**: All new features must include tests
3. **Ensure tests pass**: Run `bun run test` and verify all tests pass
4. **Update CHANGELOG**: The git hook will do this automatically, but review it
5. **Create PR**: Push your branch and create a pull request
6. **Link issues**: Reference any related issues in your PR description

### PR Checklist

- [ ] Tests pass locally (`bun run test`)
- [ ] Code follows project style guidelines
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated (automatic via git hook)
- [ ] No linting errors
- [ ] TypeScript compiles without errors

## Code Style

### TypeScript

- Use TypeScript strict mode (enabled in `tsconfig.json`)
- Prefer type inference where possible
- Use interfaces for object shapes
- Use `type` for unions and intersections

### Playwright

- Prefer semantic locators (`getByRole`, `getByText`, `getByTestId`) over CSS selectors
- Use `expect().toBeVisible()` instead of hardcoded waits
- Use `page.waitForLoadState()` when needed
- Always use `await` for async operations

### Page Object Models

- One POM per page/component
- Use `@Fixture` decorator for registration
- Use BDD decorators (`@Given`, `@When`, `@Then`) on methods
- Keep methods focused and single-purpose
- Use descriptive method names

## Documentation

- **Code comments**: Explain WHY, not WHAT
- **README.md**: Project overview and quick start
- **CLAUDE.md**: AI assistant development guide
- **docs/**: Detailed documentation (architecture, development, challenges)
- **Inline docs**: Use JSDoc for public APIs

## Getting Help

- **Issues**: Open an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check `docs/` directory for detailed guides

Thank you for contributing! 🎉


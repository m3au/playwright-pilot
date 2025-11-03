# Development Guide <!-- omit from toc -->

This guide provides setup instructions and development guidelines for the project.

![Placeholder](https://placecats.com/bella/400/200)

## Table of Contents <!-- omit from toc -->

- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
  - [Running Tests](#running-tests)
  - [Code Quality](#code-quality)
  - [Pre-commit Hooks](#pre-commit-hooks)
- [AI Assistance](#ai-assistance)
- [Writing Tests](#writing-tests)
  - [Adding a New Feature](#adding-a-new-feature)
  - [Adding a New Page Object Model](#adding-a-new-page-object-model)
  - [Best Practices](#best-practices)
  - [Test Data](#test-data)
  - [Debugging Tests](#debugging-tests)
- [Commit Guidelines](#commit-guidelines)
  - [Types](#types)
  - [Examples](#examples)
  - [Automatic Version Bumping](#automatic-version-bumping)
- [Dependencies](#dependencies)
  - [Adding Dependencies](#adding-dependencies)
  - [Updating Dependencies](#updating-dependencies)
  - [Version Pinning](#version-pinning)
- [Troubleshooting](#troubleshooting)
  - [Tests Fail Locally But Pass in CI](#tests-fail-locally-but-pass-in-ci)
- [Configuration Files](#configuration-files)
  - [Test Configuration](#test-configuration)
  - [Environment Configuration](#environment-configuration)
- [Resources](#resources)

---

## Development Setup

### Prerequisites

- **Node.js**: >= 20.0.0
- **Bun**: >= 1.2.20 (package manager and runtime)
- **Git**: Latest version

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tech-challenge

# Install dependencies
bun install

# Copy environment file
cp .env.example .env
```

### Environment Variables

**Required**: Configure environment variables in `.env`. The `.env` file should be created from `.env.example` during installation (see [Installation](#installation)).

See [Environment Configuration](#environment-configuration) for detailed variable descriptions and CI/CD setup.

## Development Workflow

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in UI mode
bun ui

# Run tests in headed mode (see browser)
bun headed

# Run tests in debug mode
bun debug

# Run only failed tests
bun failed

# Generate test files from BDD features
bun pretest
```

### Code Quality

This project enforces high code quality standards through a combination of linting, formatting, type checking, and spell checking.

For detailed information on the tools and configuration, refer to the [Code Quality Files Reference](./code-quality.md).

**Scripts:**

```bash
# Run all linters (type-check → ESLint → markdownlint)
bun lint

# Fix linting errors automatically (ESLint + markdownlint)
bun lint:fix

# Run individual linters
bun lint:typescript  # TypeScript type checking only
bun lint:eslint      # ESLint only
bun lint:markdown    # Markdown linting only
```

### Pre-commit Hooks

Husky Git hooks are configured to enforce code quality and commit message standards. They run `lint-staged` (ESLint, markdownlint, Prettier, CSpell) on `pre-commit` and TypeScript type checking on `pre-push`.

For more details on the Git hook configuration, refer to the [Code Quality Files Reference](./code-quality.md#pre-commit-hooks).

To bypass hooks temporarily:

```bash
git commit --no-verify
```

## AI Assistance

This project is configured for AI-assisted development with Cursor IDE. Rules guide AI assistants to follow project conventions and maintain code quality.

**Quick Start**:

- Rules automatically apply when editing files (context-aware based on file patterns)
- Use `@browser` for browser automation, `@playwright` for Playwright test features
- Configuration files: `.cursor/rules/` (rules), `.cursor/mcp.json` (MCP servers), `.cursorignore` (context exclusion)

For detailed information on AI configuration, rules, and MCP integrations, see [AI Tuning Documentation](./ai-tuning.md).

## Writing Tests

### Adding a New Feature

1. Create a `.feature` file in `tests/e2e/features/`
2. Write Gherkin scenarios
3. Implement step definitions in POMs using decorators

### Adding a New Page Object Model

1. Create a new file in `tests/e2e/poms/pages/` or `tests/e2e/poms/components/`
2. Use `@Fixture` decorator to register the POM (use PascalCase for fixture name matching class name)
3. Use `@Given`, `@When`, `@Then` decorators for step definitions
4. Register the POM fixture in `tests/e2e/world.ts`

For a complete implementation example, refer to `tests/e2e/poms/pages/configurator-page.ts`.

### Best Practices

1. **Use Page Object Model Pattern**: All page interactions go through POMs
2. **Use Decorators**: Step definitions are decorators on POM methods
3. **PascalCase Fixtures**: Fixture names should match class names (e.g., `@Fixture('CableConfiguratorPage')`)
4. **Wait Strategically**: Use Playwright's built-in waiting mechanisms
5. **Follow BDD Conventions**: Given/When/Then structure
6. **Step Naming**: Always start steps with "I" (e.g., "I navigate", "I click", "I see")
7. **Avoid "should"**: Use "I see" instead of "I should see"
8. **One Action Per Step**: Never use "and"/"or" in the middle of a step description

### Test Data

- Use environment variables for configuration
- Keep test data in `tests/e2e/data/`
- Avoid hardcoded values

### Debugging Tests

```bash
# Run with Playwright Inspector
bun debug

# Run in headed mode
bun headed

# Run with UI mode
bun ui
```

**Note**: For code quality tool configuration reference, see [Code Quality Files](./code-quality.md).

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

### Examples

```bash
feat(playwright): add manufacturer selection step
fix(tests): resolve timeout in basket validation
docs: update contributing guide
```

### Automatic Version Bumping

Version bumping and changelog generation happen automatically on commit:

- **`feat:`** commits → Minor version bump (0.1.0 → 0.2.0)
- **`fix:`** commits → Patch version bump (0.1.0 → 0.1.1)
- **`BREAKING CHANGE`** or **`feat!:`** → Major version bump (0.1.0 → 1.0.0)
- Other commit types → No version bump

The `prepare-commit-msg` hook automatically:

1. Bumps `package.json` version based on commit type
2. Updates `CHANGELOG.md` with the new entry
3. Stages both files for commit

No manual version management needed - just follow Conventional Commits format and versions are handled automatically.

## Dependencies

### Adding Dependencies

Add dependencies using standard Bun commands (`bun add <package-name>` or `bun add -d <package-name>` for dev dependencies).

**Important**: Always run `bun pin` after adding any dependency to pin versions to exact versions (see [Version Pinning](#version-pinning)).

### Updating Dependencies

```bash
# Update all dependencies
bun bump

# This runs: ncu -u && bun install && bun pin
```

### Version Pinning

**Important**: All dependencies must be pinned to exact versions (no `^` or `~`).

After adding a dependency, run:

```bash
bun pin
```

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check environment variables match CI values
- Verify timeout values are appropriate
- Ensure network connectivity
- Review browser version differences

## Configuration Files

### Test Configuration

- **`playwright.config.ts`**: Unified Playwright configuration with three projects:
  - `chromium`: Main E2E tests with BDD/Gherkin
  - `lighthouse`: Performance testing with Lighthouse
  - `axe`: Accessibility testing with Axe

The config includes error handling that throws if `.env` file is missing.

### Environment Configuration

**Files:**

- **`.env`**: Local environment file (gitignored, must be created manually)
- **`.env.example`**: Template for local development (copy to `.env`)
- **`.env.production`**: Production defaults for CI/CD (committed to repo, used in GitHub Actions workflows)

**Important**: All values must be provided via `.env` files (no hardcoded defaults in code). All Playwright configs throw errors if `.env` is missing or if required environment variables are not set.

**Environment Variables:**

| Variable         | Description                                                                                     | Example                       |
| ---------------- | ----------------------------------------------------------------------------------------------- | ----------------------------- |
| `BASE_URL`       | Application URL to test                                                                         | `https://www.example.com`     |
| `ENV`            | Environment name                                                                                | `development` or `production` |
| `TIMEOUT`        | Test timeout in milliseconds                                                                    | `30000`                       |
| `EXPECT_TIMEOUT` | Assertion timeout in milliseconds                                                               | `15000`                       |
| `WORKERS`        | Parallel workers (number or `%`)                                                                | `50%` or `5`                  |
| `RETRIES`        | Number of test retries on failure                                                               | `0`, `1`, or `2`              |
| `HEADED`         | Run browser in headed mode                                                                      | `true` or `false`             |
| `SLOW_MO`        | Slow down operations (milliseconds)                                                             | `0` or `100`                  |
| `TRACE`          | Trace mode for debugging (`off`, `on`, `on-first-retry`, `retain-on-failure`, `on-all-retries`) | `on-first-retry` or `on`      |

**CI/CD Configuration:**

- CI uses `.env.production` (committed to repo) with production defaults
- `BASE_URL` is overridden from GitHub Secrets (Repository → Settings → Secrets and variables → Actions → New repository secret)
- Audit tests override `WORKERS=1` via workflow env vars to avoid rate limiting

## Resources

**Testing:**

- [Playwright Documentation](https://playwright.dev/)
- [playwright-bdd Documentation](https://github.com/vitalets/playwright-bdd)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)

**Language & Runtime:**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Bun Documentation](https://bun.sh/docs)

**Code Quality:**

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [CSpell Documentation](https://cspell.org/)
- [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [SonarJS Rules](https://github.com/SonarSource/eslint-plugin-sonarjs)
- [Unicorn Rules](https://github.com/sindresorhus/eslint-plugin-unicorn)

**CI/CD:**

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

**BDD & Testing Patterns:**

- [Gherkin Syntax Reference](https://cucumber.io/docs/gherkin/reference/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

**Environment Configuration:**

- [dotenv Documentation](https://github.com/motdotla/dotenv)

**Git Hooks & Workflow:**

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)

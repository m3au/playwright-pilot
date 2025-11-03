# Technical Challenge <!-- omit from toc -->

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.56-green)](https://playwright.dev/)
[![playwright-bdd](https://img.shields.io/badge/playwright--bdd-8.4-orange)](https://github.com/vitalets/playwright-bdd)
[![Bun](https://img.shields.io/badge/Bun-1.2-black)](https://bun.sh/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![ESLint](https://img.shields.io/badge/ESLint-9.38-purple)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-UNLICENSED-lightgrey)](LICENSE)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-enabled-blue)](https://github.com/features/actions)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-enabled-brightgreen)](https://pages.github.com/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Technical challenge - Playwright E2E test automation with BDD.

![Cyberpunk](docs/cyberpunk.gif)

## Table of Contents <!-- omit from toc -->

- [About](#about)
- [Project Structure](#project-structure)
- [Development](#development)
  - [Scripts](#scripts)
  - [Architecture \& Patterns](#architecture--patterns)
  - [Configuration](#configuration)
  - [AI Assistance](#ai-assistance)
- [Code Quality](#code-quality)
- [Documentation](#documentation)

---

## Online reports! <!-- omit from toc -->

Check 👉🏼 [GitHub Pages HTML Report](https://m3au.github.io/tech-challenge/) for the _**Interactive HTML reports**_ generated automatically from Playwright test runs, including test results, traces, screenshots, and accessibility/performance audit reports.

View workflow runs 👉🏼 [GitHub Actions](https://github.com/m3au/tech-challenge/actions), we're running 30 tests, using 2 shards with 2 workers on each = 4 tests in parallel.

---

## About

This project implements a complete Playwright E2E test automation framework with:

- **BDD Testing**: Gherkin feature files with playwright-bdd
- **Page Object Model**: Decorators directly on POM methods
- **TypeScript**: Full type safety with strict mode
- **Code Quality**: ESLint, Prettier, CSpell, Husky hooks
- **CI/CD**: GitHub Actions with automated reporting

Stack:

- **Runtime**: Bun (package manager and runtime)
- **Language**: TypeScript 5.9
- **Testing**: Playwright 1.56 with playwright-bdd
- **Code Quality**: ESLint, Prettier, CSpell, SonarJS, Unicorn

---

## Project Structure

```text
tech-challenge/
├── .cursor/                      # Cursor IDE configuration
│   ├── mcp.json                  # MCP servers (Playwright, GitHub)
│   └── rules/                    # Cursor rules (commits, comments, testing, etc.)
├── .github/                      # GitHub configuration
│   ├── workflows/                # CI/CD workflows (GitHub Actions)
│   └── templates/                # Report templates (HTML)
├── .husky/                       # Git hooks (pre-commit, commit-msg, pre-push)
├── tests/                        # All test suites
│   ├── e2e/                      # End-to-end tests
│   │   ├── data/                 # Data layer (environment configs)
│   │   ├── features/             # Gherkin feature files
│   │   ├── poms/                 # Page Object Models with decorators
│   │   │   ├── components/       # Reusable component POMs
│   │   │   └── pages/            # Page POMs
│   │   ├── utils/                # Utility functions
│   │   └── world.ts              # Playwright fixtures and test setup
│   └── audit/                    # Audit tests (axe, lighthouse)
├── scripts/                      # Utility scripts
├── docs/                         # Documentation
├── package.json                  # Dependencies and scripts
├── bun.lock                      # Bun lock file (pinned dependency versions)
├── bunfig.toml                   # Bun package manager configuration
├── playwright.config.ts          # Playwright E2E configuration
├── eslint.config.js              # ESLint configuration
├── prettier.config.js            # Prettier configuration
├── tsconfig.json                 # TypeScript configuration
├── tech-challenge.code-workspace # VS Code workspace configuration
├── .cspell.jsonc                 # Spell checker configuration
├── .markdownlint.jsonc           # Markdown linting configuration
├── .lintstagedrc.json            # lint-staged configuration
├── .prettierignore               # Prettier ignore patterns
├── .editorconfig                 # Editor configuration (indentation, encoding)
├── .gitignore                    # Git ignore patterns
├── .gitattributes                # Git attributes (line endings, file types)
├── .cursorignore                 # Cursor IDE ignore patterns
├── .nvmrc                        # Node version manager version
├── .npmrc                        # npm configuration
├── .env.example                  # Environment variables template
├── .env.production               # Production environment variables template
├── .env                          # Environment variables (local, gitignored)
├── LICENSE                       # License file
└── README.md                     # This file
```

---

## Development

### Scripts

**Testing:**

```bash
bun test              # Run Playwright tests (automatically runs pretest first)
bun run pretest       # Generate test files from BDD features
bun run ui            # Run tests with Playwright UI
bun run headed        # Run tests in headed mode (see browser)
bun run debug         # Run tests in debug mode
bun run failed        # Run only failed tests from previous run
bun run axe           # Run accessibility tests
bun run lighthouse    # Run Lighthouse performance tests
```

**Code Quality:**

```bash
bun lint                # Run ESLint, TypeScript type checking, and Markdown linting
bun run lint:fix        # Fix ESLint and Markdown errors automatically
bun run lint:typescript # Run TypeScript type checking only
bun run lint:eslint     # Run ESLint only
bun run lint:markdown   # Run Markdown linting only
bun run audit           # Run npm audit
bun run clean           # Clean test output directories and build artifacts
```

**Dependencies:**

- `bun bump` - Update dependencies to latest versions and pin them
- `bun pin` - Pin all dependency versions to exact versions

For detailed information on the scripts, see [Development Guide](./docs/development.md).

### Architecture & Patterns

**Page Object Model:**

- POMs located in `tests/e2e/poms/`
- Step definitions use decorators directly on POM methods (`@Given`, `@When`, `@Then`)
- No separate step definition files
- POMs registered as fixtures in `tests/e2e/world.ts` using `@Fixture` decorator

**Fixtures:**

- World fixture (`tests/e2e/world.ts`) provides test fixtures, POM registration, and environment data
- Data layer (`tests/e2e/data/config.ts`) loads environment-specific configs

**BDD with Gherkin:**

- Feature files in `tests/e2e/features/`
- Test files generated to `test-output/bdd-gen/`

For more information about architecture and patterns, see [Architecture Documentation](./docs/architecture.md).

### Configuration

**Environment Variables:**

- Configuration via `.env` file (see `.env.example`)
- Production template: `.env.production` (used in CI/CD)
- Supports development, staging, production environments
- Timeouts and URLs configurable per environment
- All environment variables required (no hardcoded defaults)

### AI Assistance

This project is configured for AI-assisted development with Cursor IDE. Rules guide AI assistants to follow project conventions and maintain code quality.

**Quick Start**:

- Rules automatically apply when editing files (context-aware based on file patterns)
- Use `@browser` for browser automation, `@playwright` for Playwright test features
- Configuration files: `.cursor/rules/` (rules), `.cursor/mcp.json` (MCP servers), `.cursorignore` (context exclusion)

For detailed information on AI configuration, rules, and MCP integrations, see [AI Tuning Documentation](./docs/ai-tuning.md).

---

## Code Quality

This project uses comprehensive code quality tooling:

- **ESLint** (`eslint.config.js`) - Linting with TypeScript, SonarJS, Unicorn, CSpell
- **Prettier** (`prettier.config.js`) - Code formatting
- **TypeScript** (`tsconfig.json`) - Type checking with strict mode
- **CSpell** (`.cspell.jsonc`) - Spell checking (English, German, TypeScript)
- **Markdownlint** (`.markdownlint.jsonc`) - Markdown linting
- **Husky** (`.husky/`) - Git hooks (pre-commit, commit-msg, pre-push)
- **lint-staged** (`.lintstagedrc.json`) - Staged file linting
- **Conventional Commits** - Commit message format validation

**Automated Checks:**

- Pre-commit: ESLint, Prettier, CSpell
- Commit-msg: Conventional commit format validation
- Pre-push: TypeScript type checking
- CI/CD: All checks run automatically

See [Code Quality Files](./docs/code-quality.md) for detailed configuration reference.

---

## Documentation

- **[Architecture Documentation](./docs/architecture.md)** - System architecture, design decisions, and diagrams
- **[Development Guide](./docs/development.md)** - Development setup, guidelines, and best practices
- **[Code Quality Files](./docs/code-quality.md)** - Reference guide for all code quality configuration files
- **[AI Tuning](./docs/ai-tuning.md)** - Cursor IDE rules and AI assistant configuration
- **[Challenge](./docs/challenge.md)** - Challenge requirements and solution overview

---

Created with ❤️ by mū ([m3au](https://github.com/m3au))

<img src="https://avatars.githubusercontent.com/u/2736565?v=4" width="32" height="32" alt="m3au" />

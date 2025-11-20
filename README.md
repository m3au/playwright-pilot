# 🤖 Playwright BDD Cursor Template <!-- omit from toc -->

**Opinionated, Cursor-optimized Playwright BDD testing framework with built-in accessibility & performance auditing**

⚠️ **This is NOT an AI/LLM browser agent or autonomous pilot. It is a battle-tested E2E testing template that works amazingly well with Cursor's Composer/Agent.**

[![CI](https://github.com/m3au/playwright-bdd-cursor-template/actions/workflows/ci.yml/badge.svg)](https://github.com/m3au/playwright-bdd-cursor-template/actions/workflows/ci.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.56.1-green)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3.1-black)](https://bun.sh/)
[![BDD](https://img.shields.io/badge/BDD-Gherkin-green)](https://cucumber.io/docs/gherkin/)
[![Axe Accessibility](https://img.shields.io/badge/Axe%20Accessibility-4.11.0-blue)](https://github.com/dequelabs/axe-core)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-13.0.1-blue)](https://developer.chrome.com/docs/lighthouse/)
[![Cursor Ready](https://img.shields.io/badge/Cursor-Ready-brightgreen)](https://cursor.sh/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-enabled-brightgreen)](https://github.com/features/actions)
[![Coverage](https://img.shields.io/badge/Coverage-81.84%25-green)](tests/unit/)
[![TypeScript ESLint](https://img.shields.io/badge/TypeScript%20ESLint-8.46.2-blue)](https://typescript-eslint.io/)
[![SonarJS](https://img.shields.io/badge/SonarJS-3.0.5-orange)](https://github.com/SonarSource/eslint-plugin-sonarjs)
[![Unicorn](https://img.shields.io/badge/Unicorn-62.0.0-purple)](https://github.com/sindresorhus/eslint-plugin-unicorn)
[![Prettier](https://img.shields.io/badge/Prettier-code--formatter-pink)](https://prettier.io/)
[![CSpell](https://img.shields.io/badge/CSpell-9.2.2-purple)](https://cspell.org/)
[![Markdownlint](https://img.shields.io/badge/Markdownlint-0.18.1-orange)](https://github.com/DavidAnson/markdownlint)
[![Husky](https://img.shields.io/badge/Husky-9.1.7-green)](https://typicode.github.io/husky/)
[![lint-staged](https://img.shields.io/badge/lint--staged-16.2.6-yellow)](https://github.com/lint-staged/lint-staged)
[![EditorConfig](https://img.shields.io/badge/EditorConfig-enabled-blue)](https://editorconfig.org/)
[![ES Modules](https://img.shields.io/badge/ES%20Modules-enabled-brightgreen)](https://nodejs.org/api/esm.html)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-blue)](https://github.com/dependabot)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-enabled-brightgreen)](https://pages.github.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

![Cyberpunk animation showing futuristic cityscape](docs/images/cyberpunk.gif)

> **🎬 Demo Video Coming Soon**: Watch Cursor Composer generate tests, see accessibility checks in action, and explore the GitHub Actions workflow with HTML reports. [Record a 20-30 second demo](https://github.com/m3au/playwright-bdd-cursor-template/issues) and we'll feature it here!

## Table of Contents <!-- omit from toc -->

- [Why This Template Exists](#why-this-template-exists)
- [About](#about)
  - [Key Features](#key-features)
- [Test Scenarios](#test-scenarios)
  - [UITestingPlayground Challenge](#uitestingplayground-challenge)
  - [Element Identification (5 scenarios)](#element-identification-5-scenarios)
  - [Timing \& Synchronization (7 scenarios)](#timing--synchronization-7-scenarios)
  - [Interaction Challenges (5 scenarios)](#interaction-challenges-5-scenarios)
  - [Advanced Challenges (6 scenarios)](#advanced-challenges-6-scenarios)
  - [AutomationExercise Challenge](#automationexercise-challenge)
- [Test Reports](#test-reports)
- [Documentation](#documentation)
  - [Challenge Documentation](#challenge-documentation)
  - [Project Documentation](#project-documentation)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Architecture \& Patterns](#architecture--patterns)
  - [Challenge-Based Organization](#challenge-based-organization)
  - [Page Object Model (POM)](#page-object-model-pom)
  - [World Fixture](#world-fixture)
  - [BDD with Gherkin](#bdd-with-gherkin)
- [AI Assistance](#ai-assistance)
- [Code Quality](#code-quality)

---

## Why This Template Exists

Most Playwright + BDD setups are either outdated, require separate step-definition files, or completely ignore accessibility/performance. This template fixes all of that and is specifically tuned for Cursor so AI can write and maintain your tests with almost zero friction.

**The Problem:**

- Traditional BDD setups require maintaining separate step-definition files
- Most templates ignore accessibility and performance testing
- AI assistants struggle with outdated or poorly documented patterns
- Slow test execution due to Node.js runtime overhead

**The Solution:**

- ✅ Zero separate step-definition files (decorators on POM methods)
- ✅ Built-in axe-core accessibility in every run
- ✅ Lighthouse performance audit in CI
- ✅ Bun runtime → 3–5× faster installs & test runs
- ✅ Cursor.rules + MCP config included (Composer understands your project instantly)
- ✅ Parallel + sharded GitHub Actions out of the box
- ✅ Beautiful HTML report published to GitHub Pages
- ✅ Traces, video, screenshots on failure

## About

This is a **production-ready Playwright BDD testing template** optimized for Cursor IDE's AI assistant. It provides a complete, opinionated setup for writing maintainable end-to-end tests with built-in accessibility and performance auditing.

**What makes this template special:**

- **Cursor-optimized** — Comprehensive `.cursor/rules/` configuration so AI understands your project structure, patterns, and conventions instantly
- **Zero boilerplate BDD** — Decorators directly on Page Object Model methods eliminate separate step-definition files
- **Built-in audits** — Axe accessibility, Lighthouse performance, and Artillery load tests run automatically in CI
- **Bun-powered** — 3–5× faster than Node.js for installs and test execution
- **Production-ready CI/CD** — Parallel sharded tests, HTML reports on GitHub Pages, and comprehensive quality gates

**Included Examples:**

The template includes two complete challenge implementations demonstrating real-world patterns:

- **UITestingPlayground** — 23 scenarios covering element identification, timing, interactions, and advanced UI challenges
- **AutomationExercise** — 18 e-commerce scenarios including authentication, product browsing, cart management, checkout, and account features

### Key Features

- ✓ **Zero separate step-definition files** — Decorators (`@Given`, `@When`, `@Then`) directly on POM methods
- ✓ **Built-in axe-core accessibility** — WCAG compliance checks in every test run
- ✓ **Lighthouse performance audit** — Core Web Vitals and performance metrics in CI
- ✓ **Performance load testing** — Artillery-powered load tests for API performance validation
- ✓ **Bun runtime** — 3–5× faster installs & test runs vs Node.js
- ✓ **Cursor.rules + MCP config** — Composer understands your project instantly
- ✓ **Parallel + sharded GitHub Actions** — Optimized CI/CD out of the box
- ✓ **Beautiful HTML reports** — Published to GitHub Pages with traces, screenshots, videos
- ✓ **TypeScript with strict mode** — Full type safety throughout
- ✓ **Comprehensive code quality** — ESLint, Prettier, CSpell, Husky, Conventional Commits
- ✓ **Multi-environment support** — Development, staging, production via .env files
- ✓ **Local CI/CD testing** — Act integration for testing workflows before pushing

---

## Test Scenarios

**📚 Challenge Documentation**: For comprehensive details on each challenge, see:

- **[UITestingPlayground Challenge Documentation](./docs/uitestingplayground-challenge.md)** - Complete guide to all 23 scenarios
- **[AutomationExercise Challenge Documentation](./docs/automationexercise-challenge.md)** - Complete guide to all 18 scenarios
- **[JSONPlaceholder API Challenge Documentation](./docs/jsonplaceholder-challenge.md)** - Complete guide to all 34 API scenarios
- **[ReqRes.in API Challenge Documentation](./docs/reqres-challenge.md)** - Complete guide to authentication and pagination API scenarios

### UITestingPlayground Challenge

This challenge showcases **23 comprehensive test scenarios** from [UITestingPlayground](http://uitestingplayground.com/), demonstrating various automation challenges and best practices. See the [full challenge documentation](./docs/uitestingplayground-challenge.md) for exhaustive details.

### Element Identification (5 scenarios)

- **Dynamic ID** - Click button without relying on dynamic IDs
- **Class Attribute** - Handle complex class attributes with special characters
- **Verify Text** - Find elements with text split across DOM nodes
- **Non-Breaking Space** - Handle non-breaking spaces in text matching
- **Sample App** - Login flow with dynamically generated attributes

### Timing & Synchronization (7 scenarios)

- **Load Delay** - Wait for page elements to load
- **AJAX Data** - Handle elements appearing after AJAX requests
- **Client Side Delay** - Wait for client-side JavaScript calculations
- **Progress Bar** - Monitor and interact with progress indicators
- **Animated Button** - Wait for animations to complete
- **Disabled Input** - Wait for input fields to become enabled
- **Auto Wait** - Wait for elements to become interactable

### Interaction Challenges (5 scenarios)

- **Click** - Handle buttons that ignore DOM click events
- **Text Input** - Enter text using physical keyboard input
- **Mouse Over** - Handle DOM changes triggered by hover events
- **Scrollbars** - Scroll elements into view before interaction
- **Overlapped Element** - Handle elements covered by other elements

### Advanced Challenges (6 scenarios)

- **Dynamic Table** - Extract and verify values from dynamic tables
- **Shadow DOM** - Interact with elements inside Shadow DOM
- **Visibility** - Verify element visibility states (opacity, display, position)
- **Hidden Layers** - Handle z-order stacking and overlapped elements
- **Alerts** - Accept/dismiss browser dialogs and prompts
- **File Upload** - Upload files through iframe-based file inputs

All scenarios are implemented using **BDD (Gherkin)** feature files and **Page Object Model (POM)** patterns with TypeScript decorators.

### AutomationExercise Challenge

This challenge implements **18 comprehensive e-commerce test scenarios** covering the complete user journey from registration to order completion. See the [full challenge documentation](./docs/automationexercise-challenge.md) for exhaustive details.

**Implemented Features**:

- **User Authentication** (3 scenarios) — Registration, login, logout with API-backed user provisioning
- **Product Browsing** (3 scenarios) — Product listing, search, and detailed product views
- **Shopping Cart** (4 scenarios) — Add, view, update, and remove products from cart
- **Checkout Process** (2 scenarios) — Order placement, payment processing, and confirmation
- **User Account Management** (4 scenarios) — Account dashboard, profile updates, order history, invoice downloads
- **Contact & Support** (2 scenarios) — Contact form submission with file uploads

**Key Platform Handling**:

- **Cookie Consent Modal** — Automatic dismissal of `fc-consent` overlay
- **Interstitial Ads** — Detection and recovery from `google_vignette` redirects
- **User Provisioning** — API client for programmatic account creation
- **Test Data Generation** — Unique, realistic user data for each test run

### JSONPlaceholder API Challenge

This challenge demonstrates **34 comprehensive API test scenarios** using [JSONPlaceholder](https://jsonplaceholder.typicode.com/), covering all 6 resources (Posts, Users, Comments, Albums, Photos, Todos) with full CRUD operations and relationship queries. See the [full challenge documentation](./docs/jsonplaceholder-challenge.md) for exhaustive details.

**Implemented Resources**:

- **Posts** (5 scenarios) — Blog post CRUD operations
- **Users** (5 scenarios) — User management operations
- **Comments** (6 scenarios) — Comment operations with post relationships
- **Albums** (6 scenarios) — Album operations with user relationships
- **Photos** (6 scenarios) — Photo operations with album relationships
- **Todos** (6 scenarios) — Todo operations with completion status

**Key Features**:

- **API Object Model (AOM)** — Service classes following POM pattern for APIs
- **Shared Utilities** — Response verification, tracking, validation, and data generation
- **Relationship Queries** — Test nested resources (e.g., comments by post, albums by user)
- **No Browser Required** — Pure API testing without browser launch overhead

### ReqRes.in API Challenge

This challenge demonstrates **authentication and pagination testing patterns** using [ReqRes.in](https://reqres.in/), a hosted REST API for testing. See the [full challenge documentation](./docs/reqres-challenge.md) for exhaustive details.

**Implemented Features**:

- **Authentication** (4 scenarios) — Login and registration flows with token management
- **Users API** (6 scenarios) — User CRUD operations and pagination
- **Pagination** (3 scenarios) — Testing paginated data retrieval

**Key Features**:

- **Token Management** — Utility for managing authentication tokens
- **Authentication Service** — Login and registration patterns
- **Pagination Testing** — Comprehensive pagination validation
- **No Browser Required** — Pure API testing using `APIRequestContext`

### Performance Load Testing

This project includes **comprehensive performance/load testing** using Artillery with Playwright engine. Load tests validate API performance under various load conditions and are integrated into CI/CD workflows. See the [full performance testing documentation](./docs/performance-testing.md) for exhaustive details.

**Implemented Challenges**:

- **JSONPlaceholder Load Tests** — Load tests for all 6 resources (posts, users, comments, albums, photos, todos)
- **ReqRes.in Load Tests** — Authenticated and paginated API load tests
- **HTTPBin Load Tests** — HTTP method-specific load testing

**Key Features**:

- **Artillery Integration** — Load testing with Playwright engine
- **Per-Endpoint Thresholds** — Configurable performance thresholds per resource/endpoint
- **Multiple Test Types** — Normal load, stress, and spike test scenarios
- **CI/CD Integration** — Runs on every push and publishes reports to GitHub Pages
- **No Browser Required** — API load testing without browser overhead

---

## Test Reports

![Test Reports Dashboard](docs/images/dashboard.png)

Check 👉🏼 [GitHub Pages HTML Report](https://m3au.github.io/playwright-bdd-cursor-template/) for the _**Interactive HTML reports**_ generated automatically from Playwright test runs, including test results, traces, screenshots, accessibility/performance audit reports, and performance load test results.

View workflow runs 👉🏼 [GitHub Actions](https://github.com/m3au/playwright-bdd-cursor-template/actions), we're running **80 E2E test scenarios** (23 UITestingPlayground + 18 AutomationExercise + 34 JSONPlaceholder API + 5 ReqRes.in API) and **performance load tests** for JSONPlaceholder, ReqRes.in, and HTTPBin APIs using 2 shards (WORKERS=50% per shard).

---

## Documentation

Comprehensive documentation covering architecture, development workflows, code quality tools, AI assistance configuration, challenge implementations, and project goals. All documentation is located in the `docs/` directory.

### Challenge Documentation

- **[UITestingPlayground Challenge](./docs/uitestingplayground-challenge.md)** - Complete guide to all 23 UI testing scenarios, implementation details, and patterns
- **[AutomationExercise Challenge](./docs/automationexercise-challenge.md)** - Complete guide to all 18 e-commerce scenarios, user flows, and utilities
- **[JSONPlaceholder API Challenge](./docs/jsonplaceholder-challenge.md)** - Complete guide to all 34 API testing scenarios, AOM patterns, and utilities
- **[ReqRes.in API Challenge](./docs/reqres-challenge.md)** - Complete guide to authentication and pagination API testing patterns

### Project Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI assistant development guide with project-specific patterns and critical notes
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines, development workflow, and code style
- **[Architecture Documentation](./docs/architecture.md)** - System architecture, design decisions, and diagrams
- **[Development Guide](./docs/development.md)** - Development setup, guidelines, and best practices
- **[Code Quality Files](./docs/code-quality.md)** - Reference guide for all code quality configuration files
- **[AI Tuning](./docs/ai-tuning.md)** - Cursor IDE rules and AI assistant configuration
- **[Act Testing](./docs/act-testing.md)** - Local GitHub Actions workflow testing with act
- **[Changelog](./CHANGELOG.md)** - Complete version history and release notes

---

## Project Structure

A high-level view of the project's directory structure:

```text
playwright-bdd-cursor-template/
├── .cursor/                          # Cursor IDE configuration
│   ├── mcp.json                      # MCP servers (Playwright, GitHub)
│   ├── hooks/                        # Example hook scripts (copy to ~/.cursor/hooks/ to use)
│   └── rules/                        # Cursor rules (commits, comments, testing, etc.)
├── **.github/**                      # GitHub configuration
│   ├── **workflows/**                # CI/CD workflows (GitHub Actions)
│   │   ├── ci.yml                    # Main CI orchestrator workflow + report publishing
│   │   ├── preflight.yml             # Pre-flight checks (lint + unit tests)
│   │   ├── test.yml                  # E2E tests workflow
│   │   ├── lighthouse.yml            # Lighthouse audit workflow
│   │   ├── axe.yml                   # Axe audit workflow
│   │   ├── performance.yml           # Performance load tests workflow
│   │   └── dependabot.yml            # Dependabot workflow (pins versions on PRs)
│   ├── dependabot.yml                # Dependabot configuration (dependency updates)
│   └── templates/                    # Report templates (HTML)
├── .husky/                           # Git hooks (pre-commit, commit-msg, prepare-commit-msg, pre-push)
├── **tests/**                        # All test suites
│   ├── **e2e/**                      # End-to-end tests
│   │   ├── challenges/               # Challenge-specific test suites
│   │   │   ├── uitestingplayground/  # UITestingPlayground challenge
│   │   │   │   ├── features/         # Gherkin feature files
│   │   │   │   └── poms/             # Page Object Models with decorators
│   │   │   │       ├── components/   # Reusable component POMs
│   │   │   │       └── pages/        # Page POMs
│   │   │   ├── automationexercise/   # AutomationExercise challenge
│   │   │   │   ├── features/         # Gherkin feature files
│   │   │   │   └── poms/             # Page Object Models with decorators
│   │   │   │       └── pages/        # Page POMs
│   │   │   ├── jsonplaceholder/      # JSONPlaceholder API challenge
│   │   │   │   ├── features/          # Gherkin feature files
│   │   │   │   ├── services/         # API Object Models (AOM)
│   │   │   │   └── utils/            # API testing utilities
│   │   │   └── reqres/               # ReqRes.in API challenge
│   │   │       ├── features/          # Gherkin feature files
│   │   │       ├── services/         # API Object Models (AOM)
│   │   │       └── utils/            # API testing utilities
│   │   └── **world.ts**              # Playwright fixtures, test setup, and environment config
│   ├── **performance/**              # Performance/load tests
│   │   ├── challenges/               # Challenge-specific load test suites
│   │   │   ├── jsonplaceholder/      # JSONPlaceholder load tests
│   │   │   ├── reqres/               # ReqRes.in load tests
│   │   │   └── httpbin/              # HTTPBin load tests
│   │   ├── utils/                    # Performance testing utilities
│   │   └── world.ts                  # Performance test fixtures
│   ├── utils/                        # Shared utility functions
│   ├── unit/                         # Unit tests (100% coverage)
│   └── audit/                        # Audit tests (axe, lighthouse)
├── **scripts/**                      # Utility scripts
│   ├── bump-version.ts               # Automatic version bumping
│   ├── changelog.ts                  # Changelog generation
│   ├── generate-challenge-summary.ts # Challenge summary generation
│   ├── lint.ts                       # Unified linting: TypeScript → ESLint → ShellCheck
│   ├── pin-versions.ts               # Dependency version pinning
│   └── update-coverage-badge.ts      # Coverage badge update
├── docs/                             # Documentation
├── Makefile                          # Make targets for local workflow testing
├── package.json                      # Dependencies and scripts
├── bun.lock                          # Bun lock file (pinned dependency versions)
├── bunfig.toml                       # Bun package manager configuration
├── playwright.config.ts              # Playwright E2E configuration
├── eslint.config.ts                   # ESLint configuration
├── prettier.config.ts                 # Prettier configuration
├── tsconfig.json                     # TypeScript configuration
├── main.code-workspace               # VS Code workspace configuration
├── .cspell.jsonc                     # Spell checker configuration
├── .markdownlint.jsonc               # Markdown linting configuration
├── .lintstagedrc.json                # lint-staged configuration
├── .prettierignore                   # Prettier ignore patterns
├── .editorconfig                     # Editor configuration (indentation, encoding)
├── .gitignore                        # Git ignore patterns
├── .gitattributes                    # Git attributes (line endings, file types)
├── .cursorignore                     # Cursor IDE ignore patterns
├── .nvmrc                            # Node version manager version
├── .env                              # Environment variables (local, gitignored)
├── .env.example                      # Environment variables template
├── .env.production                   # Production environment variables template
├── LICENSE                           # License file
└── README.md                         # This file
```

---

## Quick Start

**Get started in under 60 seconds:**

```bash
# Clone and install
git clone https://github.com/m3au/playwright-bdd-cursor-template.git
cd playwright-bdd-cursor-template
bun install

# Configure (copy .env.example to .env)
cp .env.example .env

# Run your first test
bun run test
```

**That's it!** Your tests are running. 🎉

**Common Commands:**

```bash
bun run test                    # Run all E2E tests
bun run test:automationexercise  # Run specific challenge
bun run test:uitestingplayground # Run specific challenge
bun run test:jsonplaceholder     # Run JSONPlaceholder API challenge
bun run test:reqres              # Run ReqRes.in API challenge
bun run test:performance         # Run all performance load tests
bun run test:performance:jsonplaceholder  # Run JSONPlaceholder load tests
bun run test:performance:reqres  # Run ReqRes.in load tests
bun run test:performance:httpbin # Run HTTPBin load tests
bun test                        # Run unit tests with coverage
bun ui                          # Interactive Playwright UI
bun axe                         # Accessibility audit
bun lighthouse                  # Performance audit
bun lint                        # Run all linting checks
```

See [Development Guide](./docs/development.md#environment-configuration) for complete environment variable documentation.

**Code Quality:**

```shell
bun lint              # Run all linting: TypeScript → ESLint → ShellCheck
bun lint:fix          # Fix ESLint errors (TS, JSON, HTML, Markdown, YAML)
bun lint:typescript   # TypeScript type checking only
bun lint:eslint       # ESLint only (TS, JSON, HTML, Markdown, YAML, .mdc)
bun lint:markdown     # Markdown linting only
bun lint:shellcheck   # ShellCheck only (Husky git hooks)
```

**Local CI/CD Testing:**

Test GitHub Actions workflows locally using the Makefile (requires Docker and act):

```shell
make test        # Test E2E tests workflow locally
make lighthouse  # Test Lighthouse audit workflow locally
make axe         # Test Axe audit workflow locally
make ci          # Test main CI workflow locally
make help        # Show all available workflow test targets
```

## Architecture & Patterns

### Challenge-Based Organization

Each challenge is isolated in its own folder under `tests/e2e/challenges/`, containing:

- Feature files (`features/*.feature`)
- Page Object Models (`poms/pages/` and `poms/components/`)
- Challenge-specific configuration (`world.ts`)

This structure allows for easy addition of new challenges without affecting existing ones.

### Page Object Model (POM)

POMs are located within each challenge folder (e.g., `tests/e2e/challenges/uitestingplayground/poms/`).

**Key Features:**

- **BDD decorators** (`@Given`, `@When`, `@Then`) are applied directly to POM methods
- Eliminates separate step definition files
- POMs are automatically registered as fixtures using `@Fixture` decorator

### World Fixture

The `tests/e2e/world.ts` file is the central hub that:

**Extends Playwright-BDD:**

- Extends the standard `playwright-bdd` test
- Registers all POMs from all challenges using `@Fixture` decorator

**Provides Core Exports:**

- BDD decorators: `@Fixture`, `@Given`, `@When`, `@Then`
- Playwright types: `expect`, `Locator`, `Page`
- Custom `@Step` decorator (for internal step definitions)

**Environment Configuration:**

- `getEnvironment()` - Loads environment-specific configuration data
- `environment(name)` - Accesses environment variables directly

**Configuration Requirements:**

Each challenge must define its own `BASE_URL_<CHALLENGE>` variable (accessed via `environment(\`BASE*URL*${challengeName.toUpperCase()}\`)!`):

- `BASE_URL_UITESTINGPLAYGROUND`
- `BASE_URL_AUTOMATIONEXERCISE`
- `BASE_URL_JSONPLACEHOLDER`
- `BASE_URL_REQRES`

### BDD with Gherkin

Feature files are located within each challenge folder. Test files are automatically generated to `test-output/bdd-gen/`.

**UITestingPlayground Features:**

- `element-identification.feature` - 5 scenarios
- `timing-synchronization.feature` - 7 scenarios
- `interaction-challenges.feature` - 5 scenarios
- `advanced-challenges.feature` - 6 scenarios

**JSONPlaceholder API Features:**

- `posts.feature` - 5 scenarios
- `users.feature` - 5 scenarios
- `comments.feature` - 6 scenarios
- `albums.feature` - 6 scenarios
- `photos.feature` - 6 scenarios
- `todos.feature` - 6 scenarios

**ReqRes.in API Features:**

- `authentication.feature` - 4 scenarios (currently skipped due to API 401 responses)
- `users.feature` - 6 scenarios (3 skipped for write operations)
- `pagination.feature` - 3 scenarios

## AI Assistance

This project is configured for AI-assisted development with Cursor IDE. Rules guide AI assistants to follow project conventions and maintain code quality.

**Configuration:**

- Rules automatically apply when editing files (context-aware based on file patterns)
- Use `@browser` for browser automation, `@playwright` for Playwright test features
- Configuration files: `.cursor/rules/` (rules), `.cursor/mcp.json` (MCP servers), `.cursorignore` (context exclusion)

---

## Code Quality

This project uses comprehensive code quality tooling:

- **ESLint** (`eslint.config.ts`) - Linting with TypeScript, SonarJS, Unicorn, CSpell, Playwright, Import, Promise, Security, Regexp, No-Secrets, Perfectionist, JSON, HTML, YAML, and Markdown support
- **ShellCheck** - Shell script linting for Husky git hooks
- **Prettier** (`prettier.config.ts`) - Code formatting
- **TypeScript** (`tsconfig.json`) - Type checking with strict mode
- **CSpell** (`.cspell.jsonc`) - Spell checking (English, German, TypeScript)
- **EditorConfig** (`.editorconfig`) - Editor configuration for consistent formatting
- **Git Attributes** (`.gitattributes`) - Consistent line endings and file handling
- **Husky** (`.husky/`) - Git hooks (pre-commit, commit-msg, pre-push, prepare-commit-msg)
- **lint-staged** (`.lintstagedrc.json`) - Staged file linting
- **Conventional Commits** - Commit message format validation

**Git Hook Actions:**

- **Pre-commit**: Runs **unit tests**, then executes **lint-staged** (ESLint, Prettier, ShellCheck) on only the staged files for speed
- **Commit-msg**: Validates conventional commit format
- **Prepare-commit-msg**: Automatically calculates the next **Semantic Version** and updates the `CHANGELOG.md` based on your commit message
- **Pre-push**: TypeScript type checking
- **CI/CD**: Runs all quality gates automatically (pre-flight checks run first: lint + unit tests, then E2E/audits)

**Editor Integration:**

- **Format on Save**: Enabled via VS Code workspace settings (Prettier for all files)
- **ESLint**: Auto-fix on save enabled (TS, JS, Markdown via @eslint/markdown)
- **TypeScript**: Real-time type checking
- **CSpell**: Spell checking integrated into ESLint
- **EditorConfig**: Consistent formatting across editors

**IDE-Agnostic Configuration:**

This repository is designed to work with any IDE or editor. Universal configuration files ensure consistent formatting and behavior:

- **`.editorconfig`** - Works with all major editors (VS Code, IntelliJ, Vim, etc.)
- **`.gitattributes`** - Ensures consistent line endings (LF) and whitespace handling across platforms
- **`.prettierrc`** / `prettier.config.ts` - Formatting rules (works with Prettier extensions in any editor)
- **`.typos.toml`** - Typo detection configuration (works with `typos` CLI tool)
- **`.coderabbit.yaml`** - CodeRabbit AI PR review configuration (GitHub integration)

**Optional IDE-Specific Files:**

- **`main.code-workspace`** - VS Code workspace configuration (optional, for VS Code users)
  - Includes recommended extensions, format-on-save, and Cucumber/Gherkin support
  - Not required - all functionality works without it
- **`.cursor/rules/`** - Cursor IDE-specific AI rules (can be adapted for other AI assistants)

**Automatic Versioning:**

Version bumping and changelog generation happen automatically on commit:

- `feat:` commits → Minor version bump + changelog entry
- `fix:` commits → Patch version bump + changelog entry
- `perf:` commits → Patch version bump + changelog entry (performance improvements)
- `refactor:` commits → Patch version bump + changelog entry (code refactoring)
- `BREAKING CHANGE` → Major version bump + changelog entry
- Other commit types (`docs:`, `style:`, `test:`, `chore:`, `ci:`, `build:`) → No version bump

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

---

Created with ❤️ by mū ([m3au](https://github.com/m3au))

<img src="https://avatars.githubusercontent.com/u/2736565?v=4" width="48" height="48" alt="m3au" />

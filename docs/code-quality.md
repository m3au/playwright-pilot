# Code Quality Files Reference <!-- omit from toc -->

This document describes all code quality configuration files in the project and what they do.

![Placeholder](https://placecats.com/millie_neo/400/200)

## Table of Contents <!-- omit from toc -->

- [Overview](#overview)
- [Linting \& Formatting](#linting--formatting)
  - [`eslint.config.js`](#eslintconfigjs)
  - [`prettier.config.js`](#prettierconfigjs)
  - [`.lintstagedrc.json`](#lintstagedrcjson)
  - [`.markdownlint.jsonc`](#markdownlintjsonc)
- [Type Checking](#type-checking)
  - [`tsconfig.json`](#tsconfigjson)
- [Spell Checking](#spell-checking)
  - [`.cspell.jsonc`](#cspelljsonc)
- [Editor Configuration](#editor-configuration)
  - [`.editorconfig`](#editorconfig)
  - [`.gitattributes`](#gitattributes)
- [IDE Integration](#ide-integration)
- [Pre-commit Hooks](#pre-commit-hooks)
  - [`.husky/pre-commit`](#huskypre-commit)
  - [`.husky/commit-msg`](#huskycommit-msg)
  - [`.husky/pre-push`](#huskypre-push)

---

## Overview

Code quality tools enforce consistent standards, catch errors early, and maintain code maintainability. The project uses a layered approach combining linting, formatting, type checking, and spell checking to ensure all code meets quality standards before it reaches the repository.

| File                  | Purpose             | Runs On             |
| --------------------- | ------------------- | ------------------- |
| `eslint.config.js`    | Code linting        | Commit, manually    |
| `.markdownlint.jsonc` | Markdown linting    | Commit, manually    |
| `prettier.config.js`  | Code formatting     | Commit, manually    |
| `.lintstagedrc.json`  | Staged file linting | Commit              |
| `tsconfig.json`       | Type checking       | Manually, IDE       |
| `.cspell.jsonc`       | Spell checking      | Commit (via ESLint) |
| `.husky/pre-commit`   | Pre-commit hook     | Commit              |

Scripts from `package.json` for running code quality checks:

```bash
- `bun lint` - Run all quality checks in order: type-check → ESLint → markdownlint
- `bun lint:fix` - Auto-fix ESLint and markdownlint errors
- `bun lint:typescript` - TypeScript type checking only
- `bun lint:eslint` - ESLint only
- `bun lint:markdown` - markdownlint only
```

Automated checks run on every commit via Git hooks, providing immediate feedback. All tools can also be run manually for local development and CI/CD pipelines.

All code quality tools are integrated through:

1. **Pre-commit**: Husky → lint-staged → ESLint/markdownlint/Prettier
2. **CI/CD**: Can run lint, test in pipelines
3. **IDE**: ESLint and Prettier extensions provide real-time feedback
4. **Editor**: EditorConfig ensures consistent formatting

## Linting & Formatting

### [`eslint.config.js`](../eslint.config.js)

**Purpose**: ESLint configuration for code linting and quality checks.

**What it does**:

- Configures ESLint with TypeScript support
- Integrates multiple ESLint plugins for comprehensive code quality
- Defines rules for TypeScript, JavaScript, and E2E test files
- Sets up ignores for build artifacts and generated files

**Integrated ESLint Plugins**:

1. **[`@typescript-eslint/eslint-plugin`](https://typescript-eslint.io/)**

   - TypeScript-specific linting rules
   - Type-aware code analysis

2. **[`eslint-plugin-sonarjs`](https://github.com/SonarSource/eslint-plugin-sonarjs)**

   - Code quality and bug detection rules
   - Cognitive complexity analysis
   - Applies `sonarjs.configs.recommended.rules` to all files
   - Additional rule: `sonarjs/cognitive-complexity` (warn) for JS files

3. **[`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn)**

   - JavaScript best practices and modern patterns
   - Applies `unicorn.configs.recommended.rules` to TypeScript and JavaScript files
   - Promotes idiomatic code patterns

4. **[`@cspell/eslint-plugin`](https://github.com/streetsidesoftware/vscode-spell-checker/tree/main/packages/%40cspell/eslint-plugin)**

   - Spell checking integrated into ESLint
   - Checks comments and strings (`checkComments: true, checkStrings: true`)
   - Uses project dictionaries configured in [`.cspell.jsonc`](../.cspell.jsonc)

5. **[`eslint-plugin-playwright`](https://github.com/playwright-community/eslint-plugin-playwright)**

   - Playwright-specific linting rules and best practices
   - Provides Playwright globals (`test`, `expect`, `page`, etc.)
   - Applies `playwright.configs['flat/recommended'].rules` to test files

**File-Specific Configurations**:

- **TypeScript files** (`**/*.ts`, `**/*.tsx`): All plugins enabled
- **JavaScript files** (`**/*.js`, `**/*.mjs`, `**/*.cjs`): SonarJS, Unicorn, CSpell (no TypeScript)
- **E2E test files** (`tests/e2e/**/*.ts`, `tests/audit/**/*.ts`): TypeScript + SonarJS + Playwright (relaxed rules for test code)
- **Lighthouse test file** (`tests/audit/lighthouse.spec.ts`): Playwright rules disabled (legacy code patterns)

> ESLint runs automatically on commit via Husky hooks.

### [`prettier.config.js`](../prettier.config.js)

**Purpose**: Prettier configuration for automatic code formatting.

**What it does**:

- Sets formatting rules (semicolons, quotes, line width, etc.)
- Configures file-specific overrides (JSON files)
- Ensures consistent code style across the project

**Related**: Prettier runs automatically on commit via Husky hooks.

### [`.lintstagedrc.json`](../.lintstagedrc.json)

**Purpose**: Configures which files are linted/formatted on commit.

**What it does**:

- Runs ESLint and Prettier on staged TypeScript/JavaScript files
- Runs markdownlint-cli2 --fix and Prettier on staged Markdown files
- Runs Prettier on staged JSON, MDX, CSS, HTML, YAML files
- Only processes files that are staged for commit
- Enforces zero warnings (`--max-warnings=0`) - fails on any ESLint warnings

> Used by Husky pre-commit hook to run lint-staged.

### [`.markdownlint.jsonc`](../.markdownlint.jsonc)

**Purpose**: Markdownlint configuration for markdown file linting.

**What it does**:

- Configures markdownlint rules for consistent markdown formatting
- Enforces heading styles, list formatting, and blank line rules
- Validates link fragments and reference definitions
- Ensures code blocks have language specified

> Run `bun lint:markdown` to check markdown files, markdownlint runs automatically on commit via lint-staged.

## Type Checking

### [`tsconfig.json`](../tsconfig.json)

**Purpose**: TypeScript compiler configuration.

**What it does**:

- Configures TypeScript compilation options
- Enables strict type checking
- Sets module resolution and target
- Configures decorator support for playwright-bdd
- Defines includes/excludes for type checking

> Run `bun lint:typescript` to verify types without building.

## Spell Checking

### [`.cspell.jsonc`](../.cspell.jsonc)

**Purpose**: CSpell configuration for spell checking.

**What it does**:

- Configures dictionaries for multiple languages and domains
- Defines project-specific words (brand names, technical terms)
- Sets up regex patterns to ignore (URLs, selectors, etc.)
- Ignores build artifacts and node_modules
- Integrated with ESLint via `@cspell/eslint-plugin`

**Configured Dictionaries**:

- `en_US` - English (US)
- `de-de` - German
- `typescript` - TypeScript keywords and terminology
- `node` - Node.js terminology
- `npm` - npm package terminology
- `html` - HTML tags and attributes
- `css` - CSS properties and values
- `software-terms` - General software development terms

## Editor Configuration

### [`.editorconfig`](../.editorconfig)

**Purpose**: Editor configuration for consistent formatting.

**What it does**:

- Ensures consistent file formatting across editors
- Sets UTF-8 charset and LF line endings
- Configures 2-space indentation
- Trims trailing whitespace (except markdown files)
- Inserts final newline
- Works with most modern editors

> Complements Prettier configuration.

### [`.gitattributes`](../.gitattributes)

**Purpose**: Git attributes for consistent file handling and line endings.

**What it does**:

- Ensures LF line endings for all text files (prevents CRLF issues)
- Auto-detects text files and normalizes line endings (`text=auto eol=lf`)
- Explicitly marks source code files as text (`.ts`, `.js`, `.json`, `.jsonc`, `.md`)
- Marks binary files appropriately (images, fonts) to prevent corruption
- Treats SVG files as text for version control

> Works with EditorConfig to ensure consistent line endings across all environments and Git operations.

## IDE Integration

VS Code workspace settings (`tech-challenge.code-workspace`) configure automatic code quality on save:

- **Format on save**: Prettier automatically formats files
- **Auto-fix on save**: ESLint and markdownlint automatically fix issues
- **Ruler at 100 characters**: Visual guide for line length
- **Recommended extensions**:
  - `editorconfig.editorconfig` - EditorConfig support
  - `esbenp.prettier-vscode` - Prettier formatter
  - `dbaeumer.vscode-eslint` - ESLint integration
  - `streetsidesoftware.code-spell-checker` - CSpell spell checking
  - `DavidAnson.vscode-markdownlint` - Markdown linting

These settings ensure code quality is maintained automatically as you type and save files.

## Pre-commit Hooks

### [`.husky/pre-commit`](../.husky/pre-commit)

**Purpose**: Git pre-commit hook configuration.

**What it does**:

- Runs lint-staged before commits
- Executes ESLint, Prettier, and markdownlint on staged files
- Prevents commits with linting/formatting errors
- Ensures code quality standards are maintained

**Content**:

```bash
#!/usr/bin/env sh
bunx lint-staged
```

> Requires Husky to be installed and configured. See `package.json` `prepare` script.

### [`.husky/commit-msg`](../.husky/commit-msg)

**Purpose**: Git commit message validation hook.

**What it does**:

- Validates conventional commit format
- Ensures commits follow `type(scope): subject` format
- Provides helpful error messages with examples

**Supported commit types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

**Format**: `<type>(<scope>): <subject>`

**Examples**:

- `feat(playwright): add manufacturer selection step`
- `fix(tests): resolve timeout in basket validation`
- `docs: update contributing guide`

> Works with `.husky/pre-commit` to enforce commit standards.

### [`.husky/pre-push`](../.husky/pre-push)

**Purpose**: Git pre-push hook for type checking.

**What it does**:

- Runs `bun run lint:typescript` before push
- Catches type errors early
- Prevents pushing code with TypeScript errors

**Content**:

```bash
#!/usr/bin/env sh
bun run lint:typescript
```

> Complements pre-commit hooks by catching type errors before remote push.

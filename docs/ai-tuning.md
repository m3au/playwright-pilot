# AI Tuning Documentation <!-- omit from toc -->

This document explains Cursor IDE AI configuration including global hooks, MCP integrations, rule files, and context exclusions that guide and secure AI assistant interactions in the codebase.

![Placeholder](https://placecats.com/neo/400/200)

## Table of Contents <!-- omit from toc -->

- [Overview](#overview)
- [Global Cursor Hooks](#global-cursor-hooks)
- [MCP Integrations](#mcp-integrations)
  - [Browser MCP (Built-in)](#browser-mcp-built-in)
  - [Playwright MCP](#playwright-mcp)
  - [GitHub MCP](#github-mcp)
- [AI Agent Rules](#ai-agent-rules)
  - [`rules.mdc`](#rulesmdc)
  - [`core.mdc`](#coremdc)
  - [`comments.mdc`](#commentsmdc)
  - [`dependencies.mdc`](#dependenciesmdc)
  - [`commits.mdc`](#commitsmdc)
  - [`typescript.mdc`](#typescriptmdc)
  - [`cspell.mdc`](#cspellmdc)
  - [`playwright.mdc`](#playwrightmdc)
  - [`pom.mdc`](#pommdc)
  - [`feature.mdc`](#featuremdc)
  - [`documentation.mdc`](#documentationmdc)

---

## Overview

This project uses Cursor IDE rules (`.cursor/rules/*.mdc`) to guide AI assistants in maintaining code quality, following project conventions, and adhering to best practices. These rules ensure consistent code style, proper commit messages, and adherence to project standards.

**Configuration Files**:

- **Rule Files**: [`.cursor/rules/`](../.cursor/rules/) - Defines standards for AI behavior (project-specific)
- **Context Exclusion**: [`.cursorignore`](../.cursorignore) - Excludes files from AI context to improve performance
- **MCP Servers**: [`.cursor/mcp.json`](../.cursor/mcp.json) - Configures external tool integrations (GitHub, Playwright)
- **Global Hooks**: `~/.cursor/hooks/` - Custom scripts for AI command interception and processing (global Cursor configuration)

---

## Global Cursor Hooks

**Location**: `~/.cursor/hooks/` (global Cursor IDE configuration directory)

Custom shell scripts that intercept and process AI assistant commands before execution. These hooks are global across all projects using Cursor IDE.

**Configured Hooks**:

1. **`block-dangerous-commands.sh`** - Prevents execution of dangerous system commands (file deletion, disk formatting, permission changes)
2. **`format-markdown.sh`** - Processes markdown files before AI operations

These hooks provide an additional layer of safety by validating and potentially blocking AI-generated commands before they execute.

---

## MCP Integrations

Extends AI assistant capabilities beyond codebase with external tool integrations for browser testing and GitHub operations. Configured in [`.cursor/mcp.json`](../.cursor/mcp.json).

### Browser MCP (Built-in)

_Provides general browser automation for navigation, interaction, and screenshot capture._

Built into Cursor IDE 2.0 and later, providing native browser automation capabilities. No additional configuration required - accessible via `@browser` in AI conversations. Enables the AI assistant to navigate websites, interact with elements, take screenshots, and automate browser-based tasks without external dependencies.

### Playwright MCP

_Helps find selectors, generates Playwright test code, and provides Playwright API interactions for test authoring._

External MCP server ([`@ejazullah/mcp-playwright`](https://github.com/ejazullah/mcp-playwright)). Provides Playwright-specific test automation capabilities for finding selectors, generating test code, and Playwright API interactions. While Cursor has built-in `@browser` functionality (Browser MCP) since version 2.0, Playwright MCP complements it with test development features that the general browser automation doesn't cover, making it essential for authoring Playwright tests.

### GitHub MCP

_Enables GitHub repository management, issue/PR operations, and GitHub API interactions._

External MCP server ([`@missionsquad/mcp-github`](https://github.com/MissionSquad/mcp-github)). Provides GitHub API access for repository management, issue and PR operations, and other GitHub-related tasks. Requires `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable to authenticate API requests.

---

## AI Agent Rules

**Always Applied Rules**: Automatically active for all AI interactions

- `core.mdc` - Core principles and safety standards
- `comments.mdc` - Comment best practices
- `dependencies.mdc` - Dependency version pinning
- `cspell.mdc` - Spell checking standards
- `commits.mdc` - Conventional Commits standards

**Context-Specific Rules**: Applied based on file patterns

- `typescript.mdc` - When editing TypeScript files
- `pom.mdc` - When editing Page Object Models
- `playwright.mdc` - When editing Playwright test files
- `feature.mdc` - When editing Gherkin feature files
- `documentation.mdc` - When editing documentation files
- `rules.mdc` - When editing rule files

---

### [`rules.mdc`](../.cursor/rules/rules.mdc)

Standards for writing and maintaining rule files (`.cursor/rules/*.mdc`). Each rule file should have a single responsibility, use globs for file-specific rules, and set `alwaysApply: true` only for universal standards. Rules should point to actual codebase locations instead of generic examples, and minimize tokens to improve AI response efficiency.

---

### [`core.mdc`](../.cursor/rules/core.mdc)

Always applied core principles and safety standards. Defines communication guidelines requiring direct, concise responses without unnecessary confirmation prompts. Ensures deterministic, step-by-step reasoning for code edits and requires analysis before implementation with verification of existing patterns. Includes safety standards that prevent dangerous commands like file deletion, disk formatting, and permission changes. Applies to all interactions to ensure safe, efficient AI assistance.

---

### [`comments.mdc`](../.cursor/rules/comments.mdc)

Always applied comment best practices and ESLint disable standards. Comments should explain WHY, not WHAT, documenting complex logic, workarounds, and public APIs. When disabling ESLint rules, always include a reason explaining why. Never commit commented-out code. The rule file includes examples showing good vs. bad commenting patterns to guide AI assistants in writing meaningful comments that add value rather than noise.

---

### [`dependencies.mdc`](../.cursor/rules/dependencies.mdc)

Always applied dependency version pinning standards. Requires pinning exact versions (x.y.z) and prohibits range operators (^, ~, >=, etc.). After adding dependencies, run `node scripts/pin-versions.mjs` to ensure versions are pinned. Never commit unpinned versions. This ensures reproducible builds across different environments and prevents unexpected breaking changes from dependency updates.

---

### [`commits.mdc`](../.cursor/rules/commits.mdc)

Always applied Conventional Commits standards. Requires semantic commit messages with type prefix (feat, fix, docs, etc.), optional scope, imperative mood in subject, and proper formatting. Includes examples for simple commits, commits with scope, commits with body, multiple changes, and breaking changes. Defines rules for commit grouping, amending, and semantic versioning.

---

### [`typescript.mdc`](../.cursor/rules/typescript.mdc)

Applied to TypeScript files (`**/*.ts`, `**/*.tsx`). Enforces TypeScript standards and best practices including never using `any` or `unknown` without type guards, requiring explicit return types for functions, using ES modules only (`import`/`export`), and using `import type` for type-only imports. See `tests/e2e/poms/**/*.ts` for decorator usage examples. These standards maintain strict type safety throughout the codebase.

---

### [`cspell.mdc`](../.cursor/rules/cspell.mdc)

Always applied CSpell spell checking standards. Configuration must use `.cspell.jsonc`, with relevant dictionaries enabled (e.g., `de-de` for German). Project-specific words should be added to the `words` array, and regex patterns used for common patterns like URLs and selectors. Prefer enabling language dictionaries over adding common words individually. Ensures proper spell checking across multiple languages and technical terms.

---

### [`playwright.mdc`](../.cursor/rules/playwright.mdc)

Applied to Playwright test files (`tests/**/*.ts`, `playwright.config.ts`). Defines Playwright best practices for locator selection (prefer semantic locators like `getByRole()`), auto-waiting behavior (avoid redundant `waitForLoadState()` calls), and assertions (prefer `expect()` over `waitFor()`). See `tests/e2e/poms/components/cookie-banner.ts` and `tests/e2e/poms/pages/configurator-page.ts` for examples.

---

### [`pom.mdc`](../.cursor/rules/pom.mdc)

Applied to Page Object Model files (`tests/e2e/poms/**/*.ts`). Defines POM structure with `@Fixture` decorator registration, `@Given`/`@When`/`@Then` step definitions, and constructor injection of `Page` instance. Step methods must be async and match Gherkin scenarios exactly. POMs must be registered in `tests/e2e/world.ts`.

---

### [`feature.mdc`](../.cursor/rules/feature.mdc)

Applied to Gherkin feature files (`**/*.feature`). Defines BDD standards and best practices for feature file structure, step definitions, and scenario organization. Requires proper use of Given/When/Then/And steps, user story format in feature descriptions, and clear, reusable step definitions. Ensures scenarios are independent, testable, and follow BDD conventions. See `tests/e2e/features/cable-configurator.feature` for implementation examples.

---

### [`documentation.mdc`](../.cursor/rules/documentation.mdc)

Applied to documentation files (`**/*.{md,mdx}`, `README.md`). Defines standards for honest, direct, factual content without marketing language. Requires overview first, implementation details in the middle, examples at the end. Use active voice, precise terms, and document what exists rather than future plans.

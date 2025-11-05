/* eslint-disable playwright/no-conditional-in-test -- test setup and cleanup */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
// @ts-ignore - .mjs import not recognized by TypeScript
import { updateChangelog } from '@scripts/changelog.mjs';

describe('changelog.mjs integration', () => {
  const changelogFile = path.join(process.cwd(), 'CHANGELOG.md');
  let originalChangelog: string | undefined;

  beforeEach(() => {
    if (existsSync(changelogFile)) {
      originalChangelog = readFileSync(changelogFile, 'utf8');
    }
  });

  afterEach(() => {
    if (originalChangelog) {
      writeFileSync(changelogFile, originalChangelog);
    } else if (existsSync(changelogFile)) {
      unlinkSync(changelogFile);
    }
  });

  test('should create new changelog with version entry', () => {
    if (existsSync(changelogFile)) {
      unlinkSync(changelogFile);
    }

    const result = updateChangelog(changelogFile, 'feat: new feature', '1.0.0');

    expect(result.updated).toBe(true);
    expect(result.message).toContain('Changelog updated');
    expect(existsSync(changelogFile)).toBe(true);

    const changelog = readFileSync(changelogFile, 'utf8');
    expect(changelog).toContain('# Changelog');
    expect(changelog).toContain('## [1.0.0]');
    expect(changelog).toContain('### Added');
    expect(changelog).toContain('- new feature');
  });

  test('should add entry with scope', () => {
    if (existsSync(changelogFile)) {
      unlinkSync(changelogFile);
    }

    const result = updateChangelog(changelogFile, 'fix(auth): login bug', '1.0.1');

    expect(result.updated).toBe(true);

    const changelog = readFileSync(changelogFile, 'utf8');
    expect(changelog).toContain('### Fixed');
    expect(changelog).toContain('- **auth**: login bug');
  });

  test('should handle breaking changes', () => {
    if (existsSync(changelogFile)) {
      unlinkSync(changelogFile);
    }

    const result = updateChangelog(changelogFile, 'feat!: breaking', '2.0.0');

    expect(result.updated).toBe(true);

    const changelog = readFileSync(changelogFile, 'utf8');
    expect(changelog).toContain('### ⚠️ BREAKING CHANGES');
    expect(changelog).toContain('- breaking');
  });

  test('should add multiple entries to same version', () => {
    if (existsSync(changelogFile)) {
      unlinkSync(changelogFile);
    }

    updateChangelog(changelogFile, 'feat: first feature', '1.0.0');
    const result = updateChangelog(changelogFile, 'feat: second feature', '1.0.0');

    expect(result.updated).toBe(true);

    const changelog = readFileSync(changelogFile, 'utf8');
    expect(changelog).toContain('- first feature');
    expect(changelog).toContain('- second feature');
  });

  test('should add entries to different categories in same version', () => {
    if (existsSync(changelogFile)) {
      unlinkSync(changelogFile);
    }

    updateChangelog(changelogFile, 'feat: new feature', '1.0.0');
    const result = updateChangelog(changelogFile, 'fix: bug fix', '1.0.0');

    expect(result.updated).toBe(true);

    const changelog = readFileSync(changelogFile, 'utf8');
    expect(changelog).toContain('### Added');
    expect(changelog).toContain('- new feature');
    expect(changelog).toContain('### Fixed');
    expect(changelog).toContain('- bug fix');
  });

  test('should return false with missing commit message', () => {
    const result = updateChangelog(changelogFile, '', '1.0.0');

    expect(result.updated).toBe(false);
    expect(result.message).toContain('Missing commit message or version');
  });

  test('should return false with missing version', () => {
    const result = updateChangelog(changelogFile, 'feat: test', '');

    expect(result.updated).toBe(false);
    expect(result.message).toContain('Missing commit message or version');
  });

  test('should return false with invalid commit format', () => {
    const result = updateChangelog(changelogFile, 'invalid message', '1.0.0');

    expect(result.updated).toBe(false);
    expect(result.message).toContain('Invalid commit format');
  });

  test('should handle different commit types', () => {
    const testCases = [
      { type: 'docs', category: 'Documentation' },
      { type: 'style', category: 'Style' },
      { type: 'refactor', category: 'Refactored' },
      { type: 'test', category: 'Tests' },
      { type: 'chore', category: 'Chore' },
      { type: 'perf', category: 'Performance' },
      { type: 'ci', category: 'CI/CD' },
      { type: 'build', category: 'Build' },
      { type: 'revert', category: 'Reverted' },
    ];

    for (const { type, category } of testCases) {
      if (existsSync(changelogFile)) {
        unlinkSync(changelogFile);
      }
      const result = updateChangelog(changelogFile, `${type}: test message`, '1.0.0');

      expect(result.updated).toBe(true);
      const changelog = readFileSync(changelogFile, 'utf8');
      expect(changelog).toContain(`### ${category}`);
    }
  });

  test('should preserve existing versions when adding to current version', () => {
    const initialChangelog = `# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-15
### Added
- initial feature

## [0.9.0] - 2024-01-10
### Added
- old feature

`;
    writeFileSync(changelogFile, initialChangelog);

    const result = updateChangelog(changelogFile, 'fix: bug fix', '1.0.0');

    expect(result.updated).toBe(true);

    const changelog = readFileSync(changelogFile, 'utf8');
    expect(changelog).toContain('## [1.0.0]');
    expect(changelog).toContain('## [0.9.0]');
    expect(changelog).toContain('- old feature');
    expect(changelog).toContain('- bug fix');
  });

  test('should handle BREAKING CHANGE in commit body', () => {
    if (existsSync(changelogFile)) {
      unlinkSync(changelogFile);
    }

    const commitMessage = `feat: new api

BREAKING CHANGE: old api removed`;

    const result = updateChangelog(changelogFile, commitMessage, '2.0.0');

    expect(result.updated).toBe(true);

    const changelog = readFileSync(changelogFile, 'utf8');
    expect(changelog).toContain('### ⚠️ BREAKING CHANGES');
  });

  test('should handle BREAKING: in commit body', () => {
    if (existsSync(changelogFile)) {
      unlinkSync(changelogFile);
    }

    const commitMessage = `feat: new api

BREAKING: old api removed`;

    const result = updateChangelog(changelogFile, commitMessage, '2.0.0');

    expect(result.updated).toBe(true);

    const changelog = readFileSync(changelogFile, 'utf8');
    expect(changelog).toContain('### ⚠️ BREAKING CHANGES');
  });

  test('should insert new category before existing categories', () => {
    const initialChangelog = `# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-15
### Documentation
- initial docs

`;
    writeFileSync(changelogFile, initialChangelog);

    const result = updateChangelog(changelogFile, 'feat: new feature', '1.0.0');

    expect(result.updated).toBe(true);

    const changelog = readFileSync(changelogFile, 'utf8');
    const addedIndex = changelog.indexOf('### Added');
    const documentationIndex = changelog.indexOf('### Documentation');

    expect(addedIndex).toBeGreaterThan(0);
    expect(documentationIndex).toBeGreaterThan(0);
    expect(addedIndex).toBeLessThan(documentationIndex);
  });

  test('should handle multiple categories in existing version', () => {
    const initialChangelog = `# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-15
### Added
- feature one

### Fixed
- bug one

### Documentation
- docs one

`;
    writeFileSync(changelogFile, initialChangelog);

    const result = updateChangelog(changelogFile, 'chore: maintenance', '1.0.0');

    expect(result.updated).toBe(true);

    const changelog = readFileSync(changelogFile, 'utf8');
    expect(changelog).toContain('### Chore');
    expect(changelog).toContain('- maintenance');
  });
});

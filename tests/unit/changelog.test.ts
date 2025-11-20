import path from 'node:path';

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import {
  categoryMap,
  formatEntry,
  parseCommitMessage,
  updateChangelog,
} from '@scripts/changelog.ts';
import {
  cleanupTempDir,
  createTempDir,
  createTempFile,
  readTempFile,
} from '@utils';

describe('changelog.ts', () => {
  describe('commit message parsing', () => {
    test('parses standard commit format', () => {
      const commitMessage = 'feat: add new feature';
      const parsed = parseCommitMessage(commitMessage);

      expect(parsed).toBeTruthy();
      expect(parsed?.type).toBe('feat');
      expect(parsed?.subject).toBe('add new feature');
      expect(parsed?.scope).toBeUndefined();
      expect(parsed?.breaking).toBe(false);
    });

    test('parses commit with scope', () => {
      const commitMessage = 'fix(auth): resolve login issue';
      const parsed = parseCommitMessage(commitMessage);

      expect(parsed?.type).toBe('fix');
      expect(parsed?.scope).toBe('auth');
      expect(parsed?.subject).toBe('resolve login issue');
    });

    test('detects breaking change indicator', () => {
      const commitMessage = 'feat!: breaking change';
      const parsed = parseCommitMessage(commitMessage);

      expect(parsed?.breaking).toBe(true);
    });

    test('detects BREAKING CHANGE in commit body', () => {
      const commitMessage = `feat: new feature

BREAKING CHANGE: old api removed`;
      const parsed = parseCommitMessage(commitMessage);

      expect(parsed?.breaking).toBe(true);
    });

    test('detects BREAKING: in commit body', () => {
      const commitMessage = `feat: new feature

BREAKING: api changed`;
      const parsed = parseCommitMessage(commitMessage);

      expect(parsed?.breaking).toBe(true);
    });

    test('handles non-breaking commit without indicator', () => {
      const commitMessage = 'feat: normal feature';
      const parsed = parseCommitMessage(commitMessage);

      expect(parsed?.breaking).toBe(false);
    });

    test('returns undefined for invalid format', () => {
      const commitMessage = 'invalid message';
      const parsed = parseCommitMessage(commitMessage);

      expect(parsed).toBeUndefined();
    });

    test('returns undefined when type is missing', () => {
      const commitMessage = ': missing type';
      const parsed = parseCommitMessage(commitMessage);
      expect(parsed).toBeUndefined();
    });

    test('returns undefined when subject is missing', () => {
      const commitMessage = 'feat:';
      const parsed = parseCommitMessage(commitMessage);
      expect(parsed).toBeUndefined();
    });
  });

  describe('category mapping', () => {
    test('maps feat to Added', () => {
      expect(categoryMap['feat']).toBe('Added');
    });

    test('maps fix to Fixed', () => {
      expect(categoryMap['fix']).toBe('Fixed');
    });

    test('maps perf to Performance', () => {
      expect(categoryMap['perf']).toBe('Performance');
    });

    test('maps all commit types', () => {
      const types = Object.keys(categoryMap);
      expect(types).toContain('feat');
      expect(types).toContain('fix');
      expect(types).toContain('docs');
      expect(types.length).toBe(11);
    });
  });

  describe('entry formatting', () => {
    test('formats entry without scope', () => {
      const subject = 'add new feature';
      const entry = formatEntry(undefined, subject);

      expect(entry).toBe('- add new feature');
    });

    test('formats entry with scope', () => {
      const scope = 'auth';
      const subject = 'fix login bug';
      const entry = formatEntry(scope, subject);

      expect(entry).toBe('- **auth**: fix login bug');
    });
  });

  describe('version header formatting', () => {
    test('formats version header with date', () => {
      const version = '1.2.3';
      const date = '2024-01-15';
      const header = `## [${version}] - ${date}`;

      expect(header).toBe('## [1.2.3] - 2024-01-15');
    });

    test('matches version section regex', () => {
      const versionSectionRegex = /^## \[[\d.]+\] - \d{4}-\d{2}-\d{2}/m;
      const validHeader = '## [1.2.3] - 2024-01-15';
      const invalidHeader = '## Version 1.2.3';

      expect(versionSectionRegex.test(validHeader)).toBe(true);
      expect(versionSectionRegex.test(invalidHeader)).toBe(false);
    });
  });

  describe('date formatting', () => {
    test('formats date as ISO string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = date.toISOString().split('T')[0] as string;

      expect(formatted).toBe('2024-01-15');
    });

    test('uses current date for changelog entries', () => {
      const today = new Date().toISOString().split('T')[0] as string;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      expect(dateRegex.test(today)).toBe(true);
    });
  });

  describe('updateChangelog edge cases', () => {
    let temporaryDirectory: string;
    let temporaryChangelog: string;

    beforeEach(() => {
      temporaryDirectory = createTempDir('changelog-test-');
      temporaryChangelog = path.join(temporaryDirectory, 'CHANGELOG.md');
    });

    afterEach(() => {
      cleanupTempDir(temporaryDirectory);
    });

    test('returns error when commit message is empty', () => {
      const result = updateChangelog(temporaryChangelog, '', '1.0.0');
      expect(result.updated).toBe(false);
      expect(result.message).toBe('Missing commit message or version');
    });

    test('returns error when version is empty', () => {
      const result = updateChangelog(temporaryChangelog, 'feat: add feature', '');
      expect(result.updated).toBe(false);
      expect(result.message).toBe('Missing commit message or version');
    });

    test('inserts new category when category not found in existing version', () => {
      const existingChangelog = `# Changelog

## [1.0.0] - 2024-01-01
### Fixed
- Fixed bug

`;
      createTempFile(temporaryDirectory, 'CHANGELOG.md', existingChangelog);
      const result = updateChangelog(temporaryChangelog, 'feat: add feature', '1.0.0');
      expect(result.updated).toBe(true);
      const content = readTempFile(temporaryChangelog);
      expect(content).toContain('### Added');
      expect(content).toContain('add feature');
    });

    test('creates new version section when version does not exist', () => {
      const existingChangelog = `# Changelog

## [1.0.0] - 2024-01-01
### Fixed
- Fixed bug

`;
      createTempFile(temporaryDirectory, 'CHANGELOG.md', existingChangelog);
      const result = updateChangelog(temporaryChangelog, 'feat: new feature', '2.0.0');
      expect(result.updated).toBe(true);
      const content = readTempFile(temporaryChangelog);
      expect(content).toContain('## [2.0.0]');
      expect(content.indexOf('## [2.0.0]')).toBeLessThan(content.indexOf('## [1.0.0]'));
    });

    test('handles changelog without version sections', () => {
      const existingChangelog = `# Changelog

Some content here.
`;
      createTempFile(temporaryDirectory, 'CHANGELOG.md', existingChangelog);
      const result = updateChangelog(temporaryChangelog, 'feat: add feature', '1.0.0');
      expect(result.updated).toBe(true);
      const content = readTempFile(temporaryChangelog);
      expect(content).toContain('## [1.0.0]');
    });

    test('handles breaking change with new version', () => {
      createTempFile(temporaryDirectory, 'CHANGELOG.md', '# Changelog\n\n');
      const result = updateChangelog(temporaryChangelog, 'feat!: breaking change', '2.0.0');
      expect(result.updated).toBe(true);
      const content = readTempFile(temporaryChangelog);
      expect(content).toContain('### ⚠️ BREAKING CHANGES');
    });

    test('handles changelog without version sections but with header', () => {
      const existingChangelog = `# Changelog

Some content here.
`;
      createTempFile(temporaryDirectory, 'CHANGELOG.md', existingChangelog);
      const result = updateChangelog(temporaryChangelog, 'feat: add feature', '1.0.0');
      expect(result.updated).toBe(true);
      const content = readTempFile(temporaryChangelog);
      expect(content).toContain('## [1.0.0]');
      expect(content).toContain('add feature');
    });
  });
});

import { unlinkSync } from 'node:fs';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { updatePackageVersion } from '@scripts/bump-version.ts';
import { backupFile, createTempFile, readJsonFile } from '@utils';

describe('bump-version.ts integration', () => {
  const testPackageJson = path.join(process.cwd(), 'package.json');
  let packageJsonBackup: ReturnType<typeof backupFile> | undefined;

  beforeEach(() => {
    packageJsonBackup = backupFile(testPackageJson);
  });

  afterEach(() => {
    packageJsonBackup?.restore();
  });

  test('should bump major version for breaking change', () => {
    const packageData = readJsonFile<{ version: string }>(testPackageJson);
    const originalVersion = packageData.version;
    const [major] = originalVersion.split('.').map(Number);
    if (major === undefined) throw new Error('Invalid version format');

    const result = updatePackageVersion(testPackageJson, 'feat!: breaking change');

    expect(result.updated).toBe(true);
    expect(result.oldVersion).toBe(originalVersion);
    expect(result.newVersion).toBe(`${major + 1}.0.0`);
    expect(result.message).toContain('BREAKING CHANGE');

    const updatedPackage = readJsonFile<{ version: string }>(testPackageJson);
    expect(updatedPackage.version).toBe(`${major + 1}.0.0`);
  });

  test('should bump minor version for feat', () => {
    const packageData = readJsonFile<{ version: string }>(testPackageJson);
    const originalVersion = packageData.version;
    const [major, minor] = originalVersion.split('.').map(Number);
    if (major === undefined || minor === undefined) throw new Error('Invalid version format');

    const result = updatePackageVersion(testPackageJson, 'feat: new feature');

    expect(result.updated).toBe(true);
    expect(result.newVersion).toBe(`${major}.${minor + 1}.0`);
    expect(result.message).toContain('Feature');

    const updatedPackage = readJsonFile<{ version: string }>(testPackageJson);
    expect(updatedPackage.version).toBe(`${major}.${minor + 1}.0`);
  });

  test('should bump patch version for fix', () => {
    const packageData = readJsonFile<{ version: string }>(testPackageJson);
    const originalVersion = packageData.version;
    const [major, minor, patch] = originalVersion.split('.').map(Number);
    if (major === undefined || minor === undefined || patch === undefined) {
      throw new Error('Invalid version format');
    }

    const result = updatePackageVersion(testPackageJson, 'fix: bug fix');

    expect(result.updated).toBe(true);
    expect(result.newVersion).toBe(`${major}.${minor}.${patch + 1}`);
    expect(result.message).toContain('Fix');

    const updatedPackage = readJsonFile<{ version: string }>(testPackageJson);
    expect(updatedPackage.version).toBe(`${major}.${minor}.${patch + 1}`);
  });

  test('should bump patch version for perf', () => {
    const packageData = readJsonFile<{ version: string }>(testPackageJson);
    const originalVersion = packageData.version;
    const [major, minor, patch] = originalVersion.split('.').map(Number);
    if (major === undefined || minor === undefined || patch === undefined) {
      throw new Error('Invalid version format');
    }

    const result = updatePackageVersion(testPackageJson, 'perf: optimize code');

    expect(result.updated).toBe(true);
    expect(result.newVersion).toBe(`${major}.${minor}.${patch + 1}`);
    expect(result.message).toContain('Performance');
  });

  test('should bump patch version for refactor', () => {
    const packageData = readJsonFile<{ version: string }>(testPackageJson);
    const originalVersion = packageData.version;
    const [major, minor, patch] = originalVersion.split('.').map(Number);
    if (major === undefined || minor === undefined || patch === undefined) {
      throw new Error('Invalid version format');
    }

    const result = updatePackageVersion(testPackageJson, 'refactor: restructure');

    expect(result.updated).toBe(true);
    expect(result.newVersion).toBe(`${major}.${minor}.${patch + 1}`);
    expect(result.message).toContain('Refactor');
  });

  test('should not bump version for docs', () => {
    const packageData = readJsonFile<{ version: string }>(testPackageJson);
    const originalVersion = packageData.version;

    const result = updatePackageVersion(testPackageJson, 'docs: update readme');

    expect(result.updated).toBe(false);
    expect(result.oldVersion).toBe(originalVersion);
    expect(result.message).toContain('does not trigger version bump');

    const updatedPackage = readJsonFile<{ version: string }>(testPackageJson);
    expect(updatedPackage.version).toBe(originalVersion);
  });

  test('should return false for empty commit message', () => {
    const result = updatePackageVersion(testPackageJson, '');

    expect(result.updated).toBe(false);
    expect(result.message).toContain('No commit message provided');
  });

  test('should handle error when package.json does not exist', () => {
    expect(() => {
      updatePackageVersion('/nonexistent/package.json', 'feat: test');
    }).toThrow();
  });

  test('should handle error when package.json is invalid JSON', () => {
    const invalidPackageJson = path.join(process.cwd(), 'test-invalid-package.json');
    createTempFile(process.cwd(), 'test-invalid-package.json', 'invalid json content');

    try {
      expect(() => {
        updatePackageVersion(invalidPackageJson, 'feat: test');
      }).toThrow();
    } finally {
      unlinkSync(invalidPackageJson);
    }
  });
});

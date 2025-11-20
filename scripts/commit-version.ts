#!/usr/bin/env bun

/**
 * Commit version bump and changelog updates if they exist in staging
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

function main(): void {
  try {
    // eslint-disable-next-line sonarjs/no-os-command-from-path -- Safe: git command is required for version commit hook
    const stagedFiles = execSync('git diff --cached --name-only', {
      cwd: projectRoot,
      encoding: 'utf8',
    });

    const hasVersionChanges = /^(?:package\.json|CHANGELOG\.md)$/m.test(stagedFiles);

    if (hasVersionChanges) {
      console.log('📦 Committing version bump...');

      // eslint-disable-next-line sonarjs/no-os-command-from-path -- Safe: git command is required for version commit hook
      execSync('git commit --no-verify -m "chore(release): bump version and update changelog"', {
        cwd: projectRoot,
        stdio: 'inherit',
      });
      console.log('✅ Version committed!');
    } else {
      console.log('✅ No version changes to commit');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('⚠️  Error:', message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

#!/usr/bin/env node

/**
 * Automatic changelog generator based on Conventional Commits
 * Updates CHANGELOG.md with new entries based on commit messages
 */

// eslint-disable-next-line unicorn/import-style -- Required for __dirname pattern with ES modules
import { dirname, join } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { fileURLToPath } from 'node:url';

/**
 * @typedef {Object} CommitInfo
 * @property {string} type - Commit type (feat, fix, etc.)
 * @property {string} [scope] - Optional commit scope
 * @property {boolean} breaking - Whether this is a breaking change
 * @property {string} subject - Commit subject/message
 */

/**
 * @type {Record<string, string>}
 */
export const categoryMap = {
  feat: 'Added',
  fix: 'Fixed',
  docs: 'Documentation',
  style: 'Style',
  refactor: 'Refactored',
  test: 'Tests',
  chore: 'Chore',
  perf: 'Performance',
  ci: 'CI/CD',
  build: 'Build',
  revert: 'Reverted',
};

/**
 * Parse conventional commit message
 * @param {string} commitMessage - The commit message to parse
 * @returns {CommitInfo | undefined} Parsed commit info or undefined if invalid
 */
export function parseCommitMessage(commitMessage) {
  const commitMatch = commitMessage.match(
    /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\((.+?)\))?(!)?:\s*(.+)/,
  );

  if (!commitMatch) {
    return;
  }

  const [, type, , scope, breaking, subject] = commitMatch;
  const isBreaking =
    breaking === '!' ||
    commitMessage.includes('BREAKING CHANGE') ||
    commitMessage.includes('BREAKING:');

  return { type, scope, breaking: isBreaking, subject };
}

/**
 * Format changelog entry with optional scope
 * @param {string} [scope] - Optional scope for the entry
 * @param {string} subject - The subject/message for the entry
 * @returns {string} Formatted changelog entry
 */
export function formatEntry(scope, subject) {
  return scope ? `- **${scope}**: ${subject}` : `- ${subject}`;
}

/**
 * Update changelog with new entry
 * @param {string} changelogPath - Path to CHANGELOG.md
 * @param {string} commitMessage - Conventional commit message
 * @param {string} newVersion - New version number
 * @returns {{ updated: boolean, message?: string }} Result object
 */
// eslint-disable-next-line sonarjs/cognitive-complexity -- Complex changelog logic required
export function updateChangelog(changelogPath, commitMessage, newVersion) {
  if (!commitMessage.trim() || !newVersion) {
    return { updated: false, message: 'Missing commit message or version' };
  }

  const parsed = parseCommitMessage(commitMessage);
  if (!parsed) {
    return { updated: false, message: 'Invalid commit format' };
  }

  const { type, scope, breaking: isBreaking, subject } = parsed;
  const today = new Date().toISOString().split('T')[0];
  const category = categoryMap[type] || 'Changed';
  const entry = formatEntry(scope, subject);

  let changelogContent = '';
  changelogContent = existsSync(changelogPath)
    ? readFileSync(changelogPath, 'utf8')
    : `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;

  const versionHeader = `## [${newVersion}] - ${today}`;
  const versionSectionRegex = /^## \[[\d.]+\] - \d{4}-\d{2}-\d{2}/m;

  if (versionSectionRegex.test(changelogContent)) {
    const lines = changelogContent.split('\n');
    let insertIndex = -1;

    for (let index = 0; index < lines.length; index++) {
      if (/^## \[[\d.]+\] - \d{4}-\d{2}-\d{2}/.test(lines[index])) {
        insertIndex = index + 1;
        let categoryFound = false;

        for (let index_ = index + 1; index_ < lines.length; index_++) {
          if (
            /^### (Added|Fixed|Changed|Deprecated|Removed|Security|Documentation|Style|Refactored|Tests|Chore|Performance|CI\/CD|Build|Reverted)/.test(
              lines[index_],
            ) &&
            lines[index_].includes(category)
          ) {
            categoryFound = true;
            insertIndex = index_ + 1;
            break;
          }
          if (/^## \[[\d.]+\] - \d{4}-\d{2}-\d{2}/.test(lines[index_])) {
            break;
          }
        }

        if (!categoryFound) {
          for (let index_ = index + 1; index_ < lines.length; index_++) {
            if (/^## \[[\d.]+\] - \d{4}-\d{2}-\d{2}/.test(lines[index_])) {
              break;
            }
            if (lines[index_].startsWith('### ')) {
              insertIndex = index_;
              break;
            }
          }
          lines.splice(insertIndex, 0, `### ${category}`, '');
          insertIndex += 2;
        }

        lines.splice(insertIndex, 0, entry);
        changelogContent = lines.join('\n');
        break;
      }
    }
  } else {
    const newSection = `${versionHeader}
${isBreaking ? '### ⚠️ BREAKING CHANGES' : `### ${category}`}
${entry}

`;
    changelogContent = changelogContent.replace(/^# Changelog\n/, `# Changelog\n\n${newSection}`);
  }

  writeFileSync(changelogPath, changelogContent);

  return { updated: true, message: `Changelog updated for version ${newVersion}` };
}

function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const changelogPath = join(__dirname, '..', 'CHANGELOG.md');

  try {
    const commitMessage = process.argv[2] || '';
    const newVersion = process.argv[3] || '';
    const result = updateChangelog(changelogPath, commitMessage, newVersion);

    if (!result.updated) {
      console.log(`⚠️  ${result.message}`);
      process.exit(0);
    }

    console.log(`✅ ${result.message}`);
  } catch (error) {
    console.error('⚠️  Error updating changelog:', error.message);
    process.exit(0);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

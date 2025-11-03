#!/usr/bin/env node
/* eslint-disable unicorn/import-style */

/**
 * Automatic changelog generator based on Conventional Commits
 * Updates CHANGELOG.md with new entries based on commit messages
 */

import { dirname, join } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const changelogPath = join(__dirname, '..', 'CHANGELOG.md');

try {
  // Get commit message and version from command line arguments
  const commitMessage = process.argv[2] || '';
  const newVersion = process.argv[3] || '';

  if (!commitMessage.trim() || !newVersion) {
    console.log('⚠️  Missing commit message or version, skipping changelog update');
    process.exit(0);
  }

  // Get current date for changelog entry
  const today = new Date().toISOString().split('T')[0];

  // Parse commit message
  const commitMatch = commitMessage.match(
    /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\((.+?)\))?(!)?:\s*(.+)/,
  );
  if (!commitMatch) {
    console.log('⚠️  Invalid commit format, skipping changelog update');
    process.exit(0);
  }

  const [, type, , scope, breaking, subject] = commitMatch;
  const isBreaking =
    breaking === '!' ||
    commitMessage.includes('BREAKING CHANGE') ||
    commitMessage.includes('BREAKING:');

  // Map commit types to changelog categories
  const categoryMap = {
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

  const category = categoryMap[type] || 'Changed';
  const entry = scope ? `- **${scope}**: ${subject}` : `- ${subject}`;

  // Read or create changelog
  let changelogContent = '';
  changelogContent = existsSync(changelogPath)
    ? readFileSync(changelogPath, 'utf8')
    : `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;

  // Find or create version section
  const versionHeader = `## [${newVersion}] - ${today}`;
  const versionSectionRegex = /^## \[[\d.]+\] - \d{4}-\d{2}-\d{2}/m;

  if (versionSectionRegex.test(changelogContent)) {
    // Version section exists, add entry to it
    const lines = changelogContent.split('\n');
    let insertIndex = -1;

    // Find the version section and determine where to insert
    for (let index = 0; index < lines.length; index++) {
      if (/^## \[[\d.]+\] - \d{4}-\d{2}-\d{2}/.test(lines[index])) {
        // Found version section, find the right category or create it
        insertIndex = index + 1;
        let categoryFound = false;

        // Look for existing category
        for (let index_ = index + 1; index_ < lines.length; index_++) {
          if (
            /^### (Added|Fixed|Changed|Deprecated|Removed|Security|Documentation|Style|Refactored|Tests|Chore|Performance|CI\/CD|Build|Reverted)/.test(
              lines[index_],
            ) &&
            lines[index_].includes(category)
          ) {
            categoryFound = true;
            // Insert after category header
            insertIndex = index_ + 1;
            break;
          }
          // Stop if we hit another version section
          if (/^## \[[\d.]+\] - \d{4}-\d{2}-\d{2}/.test(lines[index_])) {
            break;
          }
        }

        // If category not found, create it
        if (!categoryFound) {
          // Find where to insert category (after version header, before next version or end)
          for (let index_ = index + 1; index_ < lines.length; index_++) {
            if (/^## \[[\d.]+\] - \d{4}-\d{2}-\d{2}/.test(lines[index_])) {
              break;
            }
            if (lines[index_].startsWith('### ')) {
              insertIndex = index_;
              break;
            }
          }
          // Insert category header
          lines.splice(insertIndex, 0, `### ${category}`, '');
          insertIndex += 2;
        }

        // Insert entry
        lines.splice(insertIndex, 0, entry);
        changelogContent = lines.join('\n');
        break;
      }
    }
  } else {
    // No version section exists, create new one
    const newSection = `${versionHeader}
${isBreaking ? '### ⚠️ BREAKING CHANGES' : `### ${category}`}
${entry}

`;
    changelogContent = changelogContent.replace(/^# Changelog\n/, `# Changelog\n\n${newSection}`);
  }

  // Write updated changelog
  writeFileSync(changelogPath, changelogContent);

  console.log(`✅ Changelog updated for version ${newVersion}`);
} catch (error) {
  console.error('⚠️  Error updating changelog:', error.message);
  // Don't fail the commit if changelog update fails
  process.exit(0);
}

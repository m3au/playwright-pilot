#!/usr/bin/env node

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Returns the installed version string for a package name.
 * @param {string} packageName
 * @param {string} basedir
 * @returns {string|undefined}
 */
function getInstalledVersion(packageName, basedir) {
  try {
    const request = createRequire(path.join(basedir, 'package.json'));
    const packageJsonPath = request.resolve(`${packageName}/package.json`);
    const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return typeof content.version === 'string' ? content.version : undefined;
  } catch {
    return;
  }
}

/**
 * Fallback: resolve a concrete version from the registry for a given range spec.
 * @param {string} packageName
 * @param {string} spec
 * @returns {string|undefined}
 */
function getRegistryVersion(packageName, spec) {
  try {
    const cmd = `npm view ${packageName}@${spec} version --json`;
    /* eslint-disable-next-line sonarjs/os-command -- Safe: npm view is a standard package manager command */
    const out = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    try {
      const parsed = JSON.parse(out);
      // eslint-disable-next-line sonarjs/slow-regex -- Simple regex, safe for version matching
      if (typeof parsed === 'string' && /\d+\.\d+\.\d+/.test(parsed)) return parsed;
      if (Array.isArray(parsed)) {
        const last = parsed.at(-1);
        // eslint-disable-next-line sonarjs/slow-regex -- Simple regex, safe for version matching
        if (typeof last === 'string' && /\d+\.\d+\.\d+/.test(last)) return last;
      }
    } catch {
      // eslint-disable-next-line sonarjs/slow-regex -- Simple regex, safe for version matching
      const matches = out.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/g);
      if (matches && matches.length > 0) return matches.at(-1);
    }
    return;
  } catch {
    return;
  }
}

/**
 * Determine if a version spec is already pinned (exact x.y.z).
 * @param {string} spec
 * @returns {boolean}
 */
function isPinned(spec) {
  if (typeof spec !== 'string') return true;
  const trimmed = spec.trim();
  if (/^[~^<>*=]/.test(trimmed)) return false;
  if (trimmed === 'latest' || trimmed === '*') return false;
  if (/^[xX]$/.test(trimmed)) return false;
  if (/\bx\b/i.test(trimmed)) return false;
  if (/^\d+$/.test(trimmed)) return false;
  if (/^\d+\.\d+$/.test(trimmed)) return false;
  const exactSemver = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
  return exactSemver.test(trimmed);
}

/**
 * Resolve an exact version for a given spec/name or return undefined if unresolved.
 * @param {string} packageName
 * @param {string} spec
 * @param {string} packageDirectory
 * @returns {string|undefined}
 */
function resolvePinnedSpec(packageName, spec, packageDirectory) {
  if (typeof spec !== 'string' || isPinned(spec)) return;
  const installed =
    getInstalledVersion(packageName, packageDirectory) ||
    getInstalledVersion(packageName, process.cwd());
  const resolved = installed || getRegistryVersion(packageName, spec);
  return resolved || undefined;
}

/**
 * Pin all deps within a single section; returns true if changes were made.
 * @param {Record<string,string>} deps
 * @param {string} packageDirectory
 * @returns {boolean}
 */
function pinSection(deps, packageDirectory) {
  if (!deps || typeof deps !== 'object') return false;
  let sectionChanged = false;
  for (const [name, spec] of Object.entries(deps)) {
    const resolved = resolvePinnedSpec(name, /** @type {string} */ (spec), packageDirectory);
    if (resolved && deps[name] !== resolved) {
      deps[name] = resolved;
      sectionChanged = true;
    }
  }
  return sectionChanged;
}

function pinFile(file) {
  const packageDirectory = path.dirname(file);
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const sections = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
  const changed = sections
    .map((section) => pinSection(json[section], packageDirectory))
    .some(Boolean);

  if (changed) {
    fs.writeFileSync(file, JSON.stringify(json, undefined, 2) + '\n');
    return true;
  }
  return false;
}

const root = process.cwd();
const packageJson = path.join(root, 'package.json');

if (!fs.existsSync(packageJson)) {
  console.error('package.json not found');
  process.exit(1);
}

if (pinFile(packageJson)) {
  console.log('Pinned versions in package.json');
} else {
  console.log('All dependencies already pinned.');
}

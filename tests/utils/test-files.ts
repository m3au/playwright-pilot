/**
 * Test file utilities for managing temporary files and directories during tests.
 */

import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Creates a temporary directory for testing.
 *
 * @param prefix - Prefix for the temporary directory name
 * @returns Path to the created temporary directory
 */
// eslint-disable-next-line unicorn/prevent-abbreviations -- "temp" is standard testing terminology
export function createTempDir(prefix: string): string {
  return mkdtempSync(path.join(tmpdir(), prefix));
}

/**
 * Creates a temporary file with optional content.
 *
 * @param directory - Directory where to create the file
 * @param filename - Name of the file to create
 * @param content - Optional content to write to the file
 * @returns Path to the created file
 */
// eslint-disable-next-line unicorn/prevent-abbreviations -- "temp" is standard testing terminology
export function createTempFile(directory: string, filename: string, content = ''): string {
  const filePath = path.join(directory, filename);
  writeFileSync(filePath, content);
  return filePath;
}

/**
 * Reads content from a temporary file.
 *
 * @param filePath - Path to the file to read
 * @returns File content as string
 */
// eslint-disable-next-line unicorn/prevent-abbreviations -- "temp" is standard testing terminology
export function readTempFile(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

/**
 * Writes content to a temporary file.
 *
 * @param filePath - Path to the file to write
 * @param content - Content to write
 */
// eslint-disable-next-line unicorn/prevent-abbreviations -- "temp" is standard testing terminology
export function writeTempFile(filePath: string, content: string): void {
  writeFileSync(filePath, content);
}

/**
 * Cleans up a temporary directory and all its contents.
 *
 * @param directory - Path to the directory to clean up
 */
// eslint-disable-next-line unicorn/prevent-abbreviations -- "temp" is standard testing terminology
export function cleanupTempDir(directory: string): void {
  if (existsSync(directory)) {
    rmSync(directory, { recursive: true, force: true });
  }
}

/**
 * Backup information for file restoration.
 */
export interface FileBackup {
  /** Path to the backed up file */
  path: string;
  /** Original content of the file, or undefined if file didn't exist */
  content: string | undefined;
  /** Function to restore the file to its original state */
  restore: () => void;
}

/**
 * Backs up a file for restoration after tests.
 *
 * @param filePath - Path to the file to backup
 * @returns Backup information with restore function
 */
export function backupFile(filePath: string): FileBackup {
  const content = existsSync(filePath) ? readFileSync(filePath, 'utf8') : undefined;
  return {
    path: filePath,
    content,
    restore: () => {
      if (content !== undefined) {
        writeFileSync(filePath, content);
      } else if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    },
  };
}

/**
 * Reads and parses a JSON file.
 *
 * @param filePath - Path to the JSON file
 * @returns Parsed JSON data
 */
export function readJsonFile<T>(filePath: string): T {
  const content = readFileSync(filePath, 'utf8');
  return JSON.parse(content) as T;
}

/**
 * Writes data to a JSON file with formatting.
 *
 * @param filePath - Path to the JSON file
 * @param data - Data to write
 */
export function writeJsonFile<T>(filePath: string, data: T): void {
  writeFileSync(filePath, JSON.stringify(data, undefined, 2));
}


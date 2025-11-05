import cspell from '@cspell/eslint-plugin';
import eslint from '@eslint/js';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import playwright from 'eslint-plugin-playwright';
import sonarjs from 'eslint-plugin-sonarjs';
import tsParser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import unicorn from 'eslint-plugin-unicorn';
import yml from 'eslint-plugin-yml';

export default [
  {
    ignores: ['**/node_modules/**', '**/coverage/**', '**/test-output/**', '!.cursor/**'],
  },
  {
    files: ['**/*.ts', '**/*.mjs'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        project: false,
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      playwright: playwright,
      sonarjs: sonarjs,
      unicorn: unicorn,
      cspell: cspell,
    },
    ...eslint.configs.recommended,
    rules: {
      ...sonarjs.configs.recommended.rules,
      ...unicorn.configs.recommended.rules,
      'cspell/spellchecker': ['warn', { checkComments: true, checkStrings: true }],
      ...playwright.configs['flat/recommended'].rules,
    },
  },
  ...yml.configs['flat/recommended'],
  ...yml.configs['flat/prettier'],
  {
    files: ['**/*.md', '.cursor/**/*.mdc'],
    ...markdown.configs.recommended[0],
  },
  {
    files: ['**/*.json'],
    language: 'json/json',
    ...json.configs.recommended,
  },
  {
    files: ['**/*.jsonc'],
    language: 'json/jsonc',
    ...json.configs.recommended,
  },
  {
    files: ['**/*.html'],
    plugins: {
      html: html,
    },
    languageOptions: {
      parser: htmlParser,
    },
    rules: {
      ...html.configs.recommended.rules,
      'html/indent': 'off',
      'html/require-closing-tags': 'off',
      'html/no-extra-spacing-attrs': 'off',
      'html/attrs-newline': 'off',
    },
  },
];

import cspell from '@cspell/eslint-plugin';
import eslint from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import sonarjs from 'eslint-plugin-sonarjs';
import tsParser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import unicorn from 'eslint-plugin-unicorn';

export default [
  eslint.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/test-output/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/*.md',
      '.github/**',
      'scripts/pin-versions.mjs',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      sonarjs: sonarjs,
      unicorn: unicorn,
      cspell: cspell,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      'no-unused-vars': 'off',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      ...sonarjs.configs.recommended.rules,
      ...unicorn.configs.recommended.rules,
      'cspell/spellchecker': ['warn', { checkComments: true, checkStrings: true }],
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        fetch: 'readonly',
        global: 'readonly',
      },
    },
    plugins: { sonarjs: sonarjs, unicorn: unicorn, cspell: cspell },
    rules: {
      ...sonarjs.configs.recommended.rules,
      ...unicorn.configs.recommended.rules,
      'sonarjs/cognitive-complexity': 'warn',
      'cspell/spellchecker': ['warn', { checkComments: true, checkStrings: true }],
    },
  },
  {
    files: ['tests/e2e/**/*.ts', 'tests/audit/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        project: false,
      },
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      playwright: playwright,
      sonarjs: sonarjs,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      ...playwright.configs['flat/recommended'].rules,
      ...sonarjs.configs.recommended.rules,
    },
  },
    {
      files: ['tests/e2e/poms/**/*.ts'],
      rules: {
        // Disabled pending refactor to use locator.waitFor() pattern
        'playwright/no-wait-for-selector': 'off',
        // Disabled pending refactor to use proper waiting strategies (locator.waitFor, expect.poll)
        'playwright/no-wait-for-timeout': 'off',
        'sonarjs/todo-tag': 'off',
      },
    },
    {
      files: ['tests/audit/lighthouse.spec.ts', 'tests/audit/axe.spec.ts'],
      rules: {
        'playwright/no-conditional-in-test': 'off',
        'playwright/no-networkidle': 'off',
      },
    },
];

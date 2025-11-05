/** @type {import("prettier").Config} */
export default {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'lf',
  arrowParens: 'always',
  bracketSpacing: true,
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: {
        trailingComma: 'none',
      },
    },
    {
      files: ['*.html'],
      options: {
        parser: 'html',
      },
    },
  ],
};

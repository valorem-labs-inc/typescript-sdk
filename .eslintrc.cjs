const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  parserOptions: {
    project,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/typescript',
  ].map(require.resolve),
  rules: {
    'no-bitwise': 'off',
    'no-console': 'warn',
    'eslint-comments/require-description': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
  },
  ignorePatterns: [
    'test',
    '*.config.*',
    'node_modules',
    'dist',
    'build',
    'coverage',
    'generated',
    'trade-interfaces',
  ],
};

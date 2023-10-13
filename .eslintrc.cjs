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
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
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
    'codegen',
    'docs',
  ],
};

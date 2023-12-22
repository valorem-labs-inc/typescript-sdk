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
  plugins: ['canonical'],
  rules: {
    'no-bitwise': 'off',
    'no-console': 'warn',
    'eslint-comments/require-description': 'off',
    'import/no-extraneous-dependencies': 'off',
    'unicorn/filename-case': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'canonical/no-barrel-import': 'error',
    'canonical/no-export-all': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.*', 'test/**/*'],
      rules: {
        'canonical/no-barrel-import': 'off',
        'import/no-default-export': 'off',
        'import/no-relative-packages': 'off',
        'no-console': 'off',
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
  ignorePatterns: [
    '*.config.*',
    'tsup*',
    'node_modules',
    'dist',
    'build',
    'coverage',
    'generated',
    'trade-interfaces',
    'codegen',
    'docs',
    'codegen.ts',
    'package.json',
    'buf.gen.yaml',
    'buf.work.yaml',
  ],
};

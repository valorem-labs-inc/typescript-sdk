import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
    },
    environment: 'node',
    include: ['**/*.test.ts'],
  },
});

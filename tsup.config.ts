import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: true,
  dts: true,
  bundle: true,
  format: ['esm'],
  splitting: true,
  target: 'es2021',
  shims: true,
});

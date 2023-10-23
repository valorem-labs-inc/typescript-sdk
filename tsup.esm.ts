import { defineConfig, Options } from 'tsup';

export const baseTsupConfig: Options = {
  entry: ['src/index.ts'],
  target: 'es2021',
  bundle: true,
  treeshake: true,
};

export default defineConfig({
  ...baseTsupConfig,
  format: ['esm'],
  outDir: 'dist/_esm',
  dts: true,
});

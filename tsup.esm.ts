import { defineConfig, Options } from 'tsup';

export const baseTsupConfig: Options = {
  entry: ['src/index.ts'],
  target: 'es2021',
  bundle: true,
  treeshake: true,
  platform: 'neutral',
};

export default defineConfig({
  ...baseTsupConfig,
  format: ['esm'],
  outDir: 'dist/_esm',
  dts: true,
});

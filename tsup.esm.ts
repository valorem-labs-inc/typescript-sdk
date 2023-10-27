import { defineConfig, Options } from 'tsup';
import { dependencies, peerDependencies } from './package.json';

export const baseTsupConfig: Options = {
  entry: ['src/index.ts'],
  target: 'es2021',
  bundle: true,
  treeshake: true,
  platform: 'neutral',
  external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],
};

export default defineConfig({
  ...baseTsupConfig,
  format: ['esm'],
  outDir: 'dist/_esm',
  dts: true,
});

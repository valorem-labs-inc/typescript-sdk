import { defineConfig } from 'tsup';
import { baseTsupConfig } from './tsup.esm';

export default defineConfig({
  ...baseTsupConfig,
  format: ['cjs'],
  outDir: 'dist/_cjs',
  sourcemap: true,
});

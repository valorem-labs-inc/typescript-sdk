import { defineConfig } from 'tsup';
import { dependencies, peerDependencies } from './package.json';

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/constants.ts',
    './src/abi/index.ts',
    './src/entities/index.ts',
    './src/entities/assets/index.ts',
    './src/entities/contracts/index.ts',
    './src/entities/options/index.ts',
    './src/entities/trader/index.ts',
    './src/lib/index.ts',
    './src/lib/grpc/index.ts',
    './src/lib/subgraph/index.ts',
    './src/utils/index.ts',
  ],
  format: ['esm'],
  platform: 'neutral',
  target: 'es2021',
  clean: true,
  bundle: true,
  splitting: true,
  dts: true,
  treeshake: true,
  sourcemap: 'inline',
  shims: true,
  outExtension({ format }) {
    return {
      js: `.${format === 'esm' ? 'm' : 'c'}js`,
      dts: `.${format}.d.ts`,
    };
  },
  external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],
});

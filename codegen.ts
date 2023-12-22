import type { CodegenConfig } from '@graphql-codegen/cli';
import { ARBITRUM_SUBGRAPH } from './src/constants';

const config: CodegenConfig = {
  schema: ARBITRUM_SUBGRAPH,
  documents: ['src/**/!(*.d).{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    './src/lib/codegen/gql/': {
      preset: 'client',
      config: {
        strictScalars: true,
        scalars: {
          ID: {
            input: 'string | number | bigint | `0x${string}`',
            output: 'string | `0x${string}`',
          },
          BigInt: { input: 'bigint', output: 'string' },
          BigDecimal: { input: 'bigint', output: 'string' },
          Bytes: '`0x${string}`',
          Int8: 'number',
        },
        useTypeImports: true,
        skipTypename: true,
        enumAsTypes: true,
        dedupeFragments: true,
        avoidOptionals: true,
        arrayInputCoercion: true,
      },
    },
  },
};

export default config;

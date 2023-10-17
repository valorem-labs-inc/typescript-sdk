import { http, createPublicClient } from 'viem';
import { arbitrumGoerli } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
});

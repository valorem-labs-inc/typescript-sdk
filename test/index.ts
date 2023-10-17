import { PublicClient } from '@wagmi/core';
import { http, createPublicClient } from 'viem';
import { arbitrumGoerli } from 'viem/chains';

export const publicClient: PublicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
});

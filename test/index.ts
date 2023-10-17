import type { PublicClient } from '@wagmi/core';
import { http, createPublicClient } from 'viem';
import { arbitrumGoerli } from 'viem/chains';

// our mock USDC on Arbitrum Goerli
export const USDC_ADDRESS = '0x8AE0EeedD35DbEFe460Df12A20823eFDe9e03458';
// our mock Wrapped ETH on Arbitrum Goerli
export const WETH_ADDRESS = '0x618b9a2Db0CF23Bb20A849dAa2963c72770C1372';

export const publicClient: PublicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
});

import { arbitrum, arbitrumSepolia, foundry } from 'viem/chains';

export type SupportedChain =
  (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];
export type SupportedChainId = SupportedChain['id'];

export const SUPPORTED_CHAINS = {
  arbitrum,
  arbitrumSepolia,
  foundry,
};

/**
 * Determines whether a given chain ID corresponds to a supported chain.
 *
 * @param chainId - The chain ID to check.
 * @returns True if the chainId is supported, otherwise false.
 */
export function isSupportedChainId(
  chainId: number,
): chainId is SupportedChainId {
  return Object.values(SUPPORTED_CHAINS)
    .map((chain) => chain.id)
    .includes(chainId as SupportedChainId);
}

import type { Address } from 'viem';
import { GRPC_ENDPOINT, DOMAIN } from '../constants';

/**
 * Arguments required for creating a SIWE (Sign-In with Ethereum) message.
 */
interface CreateSIWEMessageArgs {
  chainId: number;
  address: Address;
  nonce: string;
}

/**
 * Creates a Sign-In with Ethereum (SIWE) message for user authentication.
 * This message is typically signed by the user's Ethereum account as part of the authentication process.
 *
 * @param chainId - The blockchain network's chain ID to which the user is connecting.
 * @param address - The Ethereum address of the user.
 * @param nonce - A unique string value to prevent replay attacks.
 * @returns - A string representing the SIWE message.
 */
export const createSIWEMessage = ({
  chainId,
  address,
  nonce,
}: CreateSIWEMessageArgs) => {
  return `${DOMAIN} wants you to sign in with your Ethereum account:
${address}

I accept the Valorem Terms of Service at https://app.valorem.xyz/tos and Privacy Policy at https://app.valorem.xyz/privacy

URI: ${GRPC_ENDPOINT}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;
};

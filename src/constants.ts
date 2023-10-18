import { arbitrum, arbitrumGoerli } from 'viem/chains';

/** Chains */
export const SUPPORTED_CHAINS = {
  arbitrum,
  arbitrumGoerli,
};
export type SupportedChain =
  (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];

/** Contracts */
// Valorem Clearinghouse on Arbitrum One (mainnet) & Arbitrum Goerli (testnet)
export const CLEAR_ADDRESS = '0x402A401B1944EBb5A3030F36Aa70d6b5794190c9';
// Seaport 1.5
export const SEAPORT_ADDRESS = '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC';
// Seaport 1.1 Order Validator
export const VALIDATOR_ADDRESS = '0x00e5F120f500006757E984F1DED400fc00370000';

/** URLs */
export const GRPC_ENDPOINT = 'https://trade.valorem.xyz';
export const DOMAIN = 'trade.valorem.xyz';

/** Time & Dates */
export const ONE_DAY_UNIX = 60 * 60 * 24;
export const ONE_WEEK_UNIX = ONE_DAY_UNIX * 7;

/** Misc */
export const NULL_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

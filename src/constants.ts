/** Contracts */
// Valorem Clearinghouse on Arbitrum One (mainnet) & Arbitrum Sepolia (testnet)
export const CLEAR_ADDRESS = '0x402A401B1944EBb5A3030F36Aa70d6b5794190c9';
export const CLEAR_ADDRESS_FOUNDRY =
  '0x9f13A8276F0cc1e85F0f62c67Cf9f4f940d7D20d';
// Seaport 1.5
export const SEAPORT_ADDRESS = '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC';
// Seaport 1.1 Order Validator
export const VALIDATOR_ADDRESS = '0x00e5F120f500006757E984F1DED400fc00370000';

/** URLs */
export const GRPC_ENDPOINT = 'https://trade.valorem.xyz';
export const DOMAIN = 'trade.valorem.xyz';
export const ARBITRUM_SUBGRAPH =
  'https://api.thegraph.com/subgraphs/name/valorem-labs-inc/valorem-v1-arbitrum';
export const ARBITRUM_SEPOLIA_SUBGRAPH =
  'https://api.thegraph.com/subgraphs/name/valorem-labs-inc/valorem-v1-arbitrum-sepolia';

/** Time & Dates */
export const ONE_DAY_UNIX = 60 * 60 * 24;
export const ONE_WEEK_UNIX = ONE_DAY_UNIX * 7;

/** Misc */
export const NULL_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Represents the base scalar value for decimal calculations.
 * @remarks
 * number BASE_SCALAR - The base scalar value, set to 1e6.
 */
export const BASE_SCALAR = 1e6;

/**
 * Represents the base scalar value for decimal calculations as a BigInt.
 * @remarks
 * bigint BASE_SCALAR_BN - The base scalar value as a BigInt, set to BigInt(1e6).
 */

export const BASE_SCALAR_BN = BigInt(1e6);

/**
 * Represents the maximum number of decimal places allowed.
 * @remarks
 * number MAX_DECIMALS - The maximum number of decimal places, set to 6.
 */
export const MAX_DECIMALS = 6;

import type { createPromiseClient } from '@connectrpc/connect';
import type { Spot } from './codegen/spot_connect';
import type { Auth } from './codegen/auth_connect';
import type { Fees } from './codegen/fees_connect';
import type { RFQ } from './codegen/rfq_connect';

/**
 * Type definition for the AuthClient, which handles authentication services
 * in the Valorem Trade API. It enables users to authenticate via Sign-In with Ethereum (SIWE).
 */
export type AuthClient = ReturnType<typeof createPromiseClient<typeof Auth>>;

/**
 * Type definition for the FeesClient, used to interact with the Fees Service
 * in the Valorem Trade API. This service provides information about the fees
 * required for API usage and manages session cookies for authentication.
 */
export type FeesClient = ReturnType<typeof createPromiseClient<typeof Fees>>;

/**
 * Type definition for the RFQClient, which facilitates the Request for Quote (RFQ) process
 * in the Valorem Trade API. This service allows authenticated takers to request quotes from makers,
 * receive makers' signed offers, and execute trades on Seaport smart contracts.
 */
export type RFQClient = ReturnType<typeof createPromiseClient<typeof RFQ>>;

/**
 * Type definition for the SpotClient, used obtaining streaming spot price data
 * about various assets from the Valorem Trade API.
 */
export type SpotClient = ReturnType<typeof createPromiseClient<typeof Spot>>;

/**
 * Interface for ValoremGRPCClients, defining the gRPC clients for interacting
 * with various services of the Valorem Trade API.
 *
 * - `authClient`: For user authentication via SIWE.
 * - `feesClient`: For accessing fee-related information.
 * - `rfqClient`: For handling the RFQ process.
 * - `spotClient`: For obtaining streaming spot price data.
 *
 * Non-browser clients must implement their own cookie storage and management for
 * services that require session cookies.
 */
export interface ValoremGRPCClients {
  authClient?: AuthClient;
  feesClient?: FeesClient;
  rfqClient?: RFQClient;
  spotClient?: SpotClient;
}

import type { createPromiseClient } from '@connectrpc/connect';
import type { Auth, Fees, RFQ, Spot } from '../lib';

export type AuthClient = ReturnType<typeof createPromiseClient<typeof Auth>>;
export type FeesClient = ReturnType<typeof createPromiseClient<typeof Fees>>;
export type RFQClient = ReturnType<typeof createPromiseClient<typeof RFQ>>;
export type SpotClient = ReturnType<typeof createPromiseClient<typeof Spot>>;

export interface ValoremGRPCClients {
  authClient?: AuthClient;
  feesClient?: FeesClient; // not yet in use
  rfqClient?: RFQClient;
  spotClient?: SpotClient; // not yet in use
}

import type { PublicClient } from '@wagmi/core';
import { http, createPublicClient } from 'viem';
import { arbitrumGoerli } from 'viem/chains';
import { createGrpcTransport } from '@connectrpc/connect-node';
import { ClearinghouseContract, GRPC_ENDPOINT } from '../src';
import { trackCookieInterceptor } from '../src/grpc';

// our mock USDC on Arbitrum Goerli
export const USDC_ADDRESS = '0x8AE0EeedD35DbEFe460Df12A20823eFDe9e03458';
// our mock Wrapped ETH on Arbitrum Goerli
export const WETH_ADDRESS = '0x618b9a2Db0CF23Bb20A849dAa2963c72770C1372';

export const publicClient: PublicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
});

export const clearinghouse = new ClearinghouseContract({
  publicClient,
});

// transport for connection to Valorem Trade gRPC server
export const transport = createGrpcTransport({
  baseUrl: GRPC_ENDPOINT,
  httpVersion: '2',
  interceptors: [trackCookieInterceptor],
  nodeOptions: {
    // TODO THIS IS INSECURE
    // cert: TLS_CERT, // doesnt work
    // ca: CA, // doesnt work
    rejectUnauthorized: false, // insecure
  },
});

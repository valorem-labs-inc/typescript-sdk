import type { PublicClient } from '@wagmi/core';
import { http, createPublicClient } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { createGrpcTransport } from '@connectrpc/connect-node';
import { ClearinghouseContract, GRPC_ENDPOINT } from '../src';
import { trackCookieInterceptor } from '../src/grpc';

// our mock USDC on Arbitrum Sepolia
export const USDC_ADDRESS = '0xa957Cfc02c20D513aAfA5FaA91A5Ff0068eE2De7';
// our mock Wrapped ETH on Arbitrum Sepolia
export const WETH_ADDRESS = '0x9Eb7fE3FA85f44e74e0407d060429e5a11431f3E';

export const publicClient: PublicClient = createPublicClient({
  chain: arbitrumSepolia,
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

import { createGrpcTransport } from '@connectrpc/connect-node';
import { ConnectError, createPromiseClient } from '@connectrpc/connect';
import { Auth, RFQ } from '../lib';
// import { TLS_CERT } from '../certs';
import { GRPC_ENDPOINT } from './constants';

let COOKIE: string | undefined; // to be used for all server interactions

// custom Connect-node transport interceptor for retrieving cookie
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const trackCookie = (next: any) => async (req: any) => {
  if (COOKIE !== undefined) {
    req.header = [['cookie', COOKIE]];
  }
  const res = await next({
    ...req,
    headers: { ...req.headers, cookie: COOKIE },
  });
  COOKIE = res.header?.get('set-cookie')?.split(';')[0] ?? COOKIE;
  return res;
};

// transport for connection to Valorem Trade gRPC server
const transport = createGrpcTransport({
  baseUrl: GRPC_ENDPOINT,
  httpVersion: '2',
  interceptors: [trackCookie],
  nodeOptions: {
    // ca: TLS_CERT,
    // TODO THIS IS INSECURE
    rejectUnauthorized: false,
  },
});

export const authClient: ReturnType<typeof createPromiseClient<typeof Auth>> =
  createPromiseClient(Auth, transport);
export const rfqClient: ReturnType<typeof createPromiseClient<typeof RFQ>> =
  createPromiseClient(RFQ, transport);

export const handleGRPCRequest = async <T>(
  request: () => Promise<T>,
): Promise<T | null> => {
  try {
    return await request();
  } catch (error) {
    if (error instanceof ConnectError) {
      const err = ConnectError.from(error);
      console.error(`\nGRPC Error: ${err.message}\nCode: ${err.code}\n`);
    }
    return null;
  }
};

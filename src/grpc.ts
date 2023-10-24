import type { Interceptor, createPromiseClient } from '@connectrpc/connect';
import { ConnectError } from '@connectrpc/connect';
import type { Auth, RFQ } from './lib';

let COOKIE: string | undefined; // to be used for all server interactions

/**
 * Custom Connect transport interceptor for retrieving & storing session cookie
 */
export const trackCookieInterceptor: Interceptor = (next) => async (req) => {
  if (COOKIE !== undefined) {
    req.header.set('cookie', COOKIE);
  }
  const res = await next(req);
  COOKIE = res.header.get('set-cookie')?.split(';')[0] ?? COOKIE;
  return res;
};

export type AuthClient = ReturnType<typeof createPromiseClient<typeof Auth>>;
export type RFQClient = ReturnType<typeof createPromiseClient<typeof RFQ>>;

export const handleGRPCRequest = async <T>(
  request: () => Promise<T>,
): Promise<T | null> => {
  try {
    return await request();
  } catch (error) {
    const err = ConnectError.from(error);
    console.error(`\nGRPC Error: ${err.message}\nCode: ${err.code}\n`);
    return null;
  }
};

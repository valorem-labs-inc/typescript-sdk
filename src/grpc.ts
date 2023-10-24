import type { createPromiseClient } from '@connectrpc/connect';
import { ConnectError } from '@connectrpc/connect';
import type { Auth, RFQ } from './lib';

let COOKIE: string | undefined; // to be used for all server interactions

// custom Connect-node transport interceptor for retrieving cookie
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trackCookieInterceptor = (next: any) => async (req: any) => {
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

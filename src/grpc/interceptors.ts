import type { Interceptor } from '@connectrpc/connect';

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

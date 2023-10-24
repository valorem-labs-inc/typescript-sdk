import type { Interceptor } from '@connectrpc/connect';
import type { Logger } from '../logger';

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

/**
 * Custom Connect transport interceptor for logging requests & responses
 */
export const getloggerInterceptor = (logger: Logger) => {
  const loggerInterceptor: Interceptor = (next) => async (req) => {
    logger.debug(`sending message to ${req.url}`);
    const res = await next(req);
    if (!res.stream) {
      logger.debug('message:', res.message);
    }
    return res;
  };
  return loggerInterceptor;
};

import type { Interceptor } from '@connectrpc/connect';

/**
 * A global variable to store the session cookie. This cookie is used across
 * all server interactions for maintaining session state.
 */
let COOKIE: string | undefined;

/**
 * A custom interceptor for Connect's transport layer to handle session cookies.
 * This interceptor is crucial for non-browser clients that interact with the
 * Valorem Trade API, as these clients need to manage session cookies manually.
 *
 * The interceptor does two main things:
 * 1. Attaches the stored session cookie to outgoing requests.
 * 2. Updates the stored session cookie based on the 'set-cookie' header from responses.
 *
 * @param next - The next function in the interceptor chain.
 * @returns A function that takes a request and returns a processed response.
 */
export const trackCookieInterceptor: Interceptor = (next) => async (req) => {
  // Attach the stored session cookie to the outgoing request headers.
  if (COOKIE !== undefined) {
    req.header.set('cookie', COOKIE);
  }

  // Process the request and obtain the response.
  const res = await next(req);

  // Update the stored session cookie based on the response's 'set-cookie' header.
  COOKIE = res.header.get('set-cookie')?.split(';')[0] ?? COOKIE;

  // Return the processed response.
  return res;
};

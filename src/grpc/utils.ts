import { ConnectError } from '@connectrpc/connect';

/**
 * Handles a gRPC request and provides standardized error handling.
 * This utility function wraps a gRPC request and catches any errors that occur,
 * logging them and returning null in case of a failure.
 *
 * @param request - A function that returns a Promise representing the gRPC request.
 * @returns A Promise containing the result of the gRPC request, or null if an error occurs.
 */
export const handleGRPCRequest = async <T>(
  request: () => Promise<T>,
): Promise<T | null> => {
  try {
    // Attempt to execute the provided gRPC request.
    return await request();
  } catch (error) {
    // Handle any errors that occur during the gRPC request.
    const err = ConnectError.from(error);

    // Log the error details for debugging purposes.
    console.error(`\nGRPC Error: ${err.message}\nCode: ${err.code}\n`);

    // Return null to indicate that the request failed.
    return null;
  }
};

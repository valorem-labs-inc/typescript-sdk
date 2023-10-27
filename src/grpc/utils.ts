import { ConnectError } from '@connectrpc/connect';

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

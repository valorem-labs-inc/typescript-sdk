import { ConnectError } from '@connectrpc/connect';
import type { Logger } from '../logger';

export const handleGRPCRequest = async <T>(
  request: () => Promise<T>,
  logger: Logger,
): Promise<T | null> => {
  try {
    return await request();
  } catch (error) {
    const err = ConnectError.from(error);
    logger.error(`\nGRPC Error: ${err.message}\nCode: ${err.code}\n`);
    return null;
  }
};

import type { Abi, Account, Chain, WriteContractParameters } from 'viem';

export type SimulatedTxRequest = WriteContractParameters<
  Abi,
  string,
  Chain | undefined,
  Account | undefined,
  Chain
>;

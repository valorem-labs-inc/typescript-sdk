import type {
  Abi,
  Account,
  Address,
  Chain,
  WriteContractParameters,
} from 'viem';

export type SimulatedTxRequest = WriteContractParameters<
  Abi,
  string,
  Chain | undefined,
  Account | undefined,
  Chain
>;

// TODO(These types need to be extended and enhanced to support the full range of types used)
// And to favor enums and true data keys over token symbols and strings/numbers interpolated
// throughout the codebase.

export interface OptionTypeInfo {
  underlyingAsset: Address;
  underlyingAmount: bigint;
  exerciseAsset: Address;
  exerciseAmount: bigint;
  exerciseTimestamp: number;
  expiryTimestamp: number;
}

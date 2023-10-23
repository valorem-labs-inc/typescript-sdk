import type {
  Abi,
  Account,
  Address,
  Chain,
  WriteContractParameters,
} from 'viem';
import type { SUPPORTED_CHAINS } from './constants';

export type SimulatedTxRequest = WriteContractParameters<
  Abi,
  string,
  Chain | undefined,
  Account | undefined,
  Chain
>;

export type SupportedChain =
  (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];
export type SupportedChainId = SupportedChain['id'];

export type SupportedAssetSymbol = 'USDC' | 'WETH';

export interface OptionTypeInfo {
  underlyingAsset: Address;
  underlyingAmount: bigint;
  exerciseAsset: Address;
  exerciseAmount: bigint;
  exerciseTimestamp: number;
  expiryTimestamp: number;
}

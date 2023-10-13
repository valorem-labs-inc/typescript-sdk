import { CLEAR_ADDRESS } from '~/constants';
import { CLEAR_ABI } from '~/abis';
import type { IClearinghouse, ContractConstructorArgs } from './base-contract';
import { Contract } from './base-contract';

export class ClearinghouseContract extends Contract<IClearinghouse> {
  public constructor(
    args: Pick<ContractConstructorArgs, 'publicClient' | 'walletClient'>,
  ) {
    super({ ...args, address: CLEAR_ADDRESS, abi: CLEAR_ABI });
  }
}

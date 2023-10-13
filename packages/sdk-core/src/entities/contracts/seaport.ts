import { SEAPORT_ADDRESS } from '../../utils/constants';
import { SEAPORT_V1_5_ABI } from '../../abis';
import type { ContractConstructorArgs, ISeaport } from './base-contract';
import { Contract } from './base-contract';

export class SeaportContract extends Contract<ISeaport> {
  public constructor(
    args: Pick<ContractConstructorArgs, 'publicClient' | 'walletClient'>,
  ) {
    super({ ...args, address: SEAPORT_ADDRESS, abi: SEAPORT_V1_5_ABI });
  }
}

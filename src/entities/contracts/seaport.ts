import { SEAPORT_V1_5_ABI } from '../../abis';
import { SEAPORT_ADDRESS } from '../../constants';
import type { ContractConstructorArgs, ISeaport } from './base-contract';
import { Contract } from './base-contract';
import { SeaportValidatorContract } from './seaport-validator';

export class SeaportContract extends Contract<ISeaport> {
  public validator: SeaportValidatorContract;

  public constructor(
    args: Pick<ContractConstructorArgs, 'publicClient' | 'walletClient'>,
  ) {
    super({ ...args, address: SEAPORT_ADDRESS, abi: SEAPORT_V1_5_ABI });
    this.validator = new SeaportValidatorContract({
      publicClient: args.publicClient,
      walletClient: args.walletClient,
    });
  }
}

import { SEAPORT_V1_5_ABI } from '../../abi';
import { SEAPORT_ADDRESS } from '../../constants';
import type { ContractConstructorArgs, ISeaport } from './base-contract';
import { Contract } from './base-contract';
import { SeaportValidatorContract } from './seaport-validator';

export class SeaportContract extends Contract<ISeaport> {
  public validator: SeaportValidatorContract;

  public constructor(args: Omit<ContractConstructorArgs, 'address' | 'abi'>) {
    super({ ...args, address: SEAPORT_ADDRESS, abi: SEAPORT_V1_5_ABI });
    this.validator = new SeaportValidatorContract(args);
  }
}

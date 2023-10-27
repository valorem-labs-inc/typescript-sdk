import type { Address } from 'viem';
import { getContract } from 'viem';
import { SEAPORT_VALIDATOR_ABI } from '../../abi';
import { VALIDATOR_ADDRESS } from '../../constants';
import type {
  ContractConstructorArgs,
  ISeaportValidator,
} from './base-contract';

export class SeaportValidatorContract {
  public address: Address;
  public read: ISeaportValidator['read'];

  private contract: ISeaportValidator;

  public constructor({
    publicClient,
    walletClient,
  }: Omit<ContractConstructorArgs, 'abi' | 'address'>) {
    this.contract = getContract({
      address: VALIDATOR_ADDRESS,
      abi: SEAPORT_VALIDATOR_ABI,
      walletClient,
      publicClient,
    }) as unknown as ISeaportValidator;

    this.address = VALIDATOR_ADDRESS;
    this.read = this.contract.read;
  }
}

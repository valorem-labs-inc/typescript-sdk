import type { Address } from 'viem';
import { getContract } from 'viem';
import { SEAPORT_VALIDATOR_ABI } from '../../abi';
import { VALIDATOR_ADDRESS } from '../../constants';
import type {
  ContractConstructorArgs,
  ISeaportValidator,
} from './base-contract';

/**
 * Provides an interface to the Seaport Validator contract which contains methods
 * for validating Seaport orders. It handles the retrieval and processing of error
 * and warning messages that assist in debugging order issues.
 */
export class SeaportValidatorContract {
  /**
   * The address of the Seaport Validator smart contract.
   */
  public address: Address;

  /**
   * Read-only interface of the Seaport Validator contract, containing validation methods.
   */
  public read: ISeaportValidator['read'];

  private contract: ISeaportValidator;

  /**
   * Constructs a new SeaportValidatorContract instance, setting up the connection
   * to the validator contract deployed at a known address.
   *
   * @param publicClient - The public client used for interacting with the blockchain.
   * @param walletClient - The wallet client used for signed transactions, not necessary
   * for read-only interactions with the validator.
   */
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

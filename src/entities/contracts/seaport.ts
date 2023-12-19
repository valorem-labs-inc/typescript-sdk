import { SEAPORT_V1_5_ABI } from '../../abi/seaport';
import { SEAPORT_ADDRESS } from '../../constants';
import type { ContractConstructorArgs, ISeaport } from './base-contract';
import { Contract } from './base-contract';
import { SeaportValidatorContract } from './seaport-validator';

/**
 * Extends the generic Contract class to interact with the Seaport protocol,
 * enabling trading functionalities for ERC20, ERC721, ERC1155 and native gas tokens.
 * This class provides a structured interface to the Seaport smart contract and its
 * operations.
 */
export class SeaportContract extends Contract<ISeaport> {
  /**
   * An instance of SeaportValidatorContract, for offer validation within the Seaport protocol.
   */
  public validator: SeaportValidatorContract;

  /**
   * Constructs a new SeaportContract instance with the specified arguments.
   * Initializes the SeaportValidatorContract for offer validation.
   *
   * @param args - Contains the publicClient and optionally walletClient for interaction
   * with the Seaport protocol.
   */
  public constructor(
    args: Pick<ContractConstructorArgs, 'publicClient' | 'walletClient'>,
  ) {
    super({ ...args, address: SEAPORT_ADDRESS, abi: SEAPORT_V1_5_ABI });
    this.validator = new SeaportValidatorContract(args);
  }
}

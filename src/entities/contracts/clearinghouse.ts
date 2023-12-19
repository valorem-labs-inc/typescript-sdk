import { CLEAR_ADDRESS } from '../../constants';
import { CLEAR_ABI } from '../../abi/clearinghouse';
import type { IClearinghouse, ContractConstructorArgs } from './base-contract';
import { Contract } from './base-contract';

/**
 * Specialized contract that extends the generic Contract class to interact
 * specifically with the Valorem Clearinghouse. It encapsulates the functionality
 * to write and settle option contracts on-chain.
 *
 * The ClearinghouseContract enables users to write options, execute them,
 * and redeem claim tokens post-expiration, handling ERC-20 asset pairs.
 */
export class ClearinghouseContract extends Contract<IClearinghouse> {
  /**
   * Initializes a new instance of the ClearinghouseContract with the specific address
   * and ABI
   for the Valorem Clear smart contract. This contract is responsible for the

   creation, settlement, and redemption of options and claims within the Valorem ecosystem.
   @param args - Contains the publicClient and optionally walletClient for interaction
    with the blockchain.
   */
  public constructor(
    args: Pick<ContractConstructorArgs, 'publicClient' | 'walletClient'>,
  ) {
    super({ ...args, address: CLEAR_ADDRESS, abi: CLEAR_ABI });
  }
}

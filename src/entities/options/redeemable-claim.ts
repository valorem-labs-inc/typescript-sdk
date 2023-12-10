import type { Trader } from '../trader/base-trader';
import type { SimulatedTxRequest } from '../../types';
import type { ClearinghouseContract } from '../contracts';
import type { OptionTypeArgs } from './option-type';
import { OptionType } from './option-type';

/**
 * Arguments required for constructing a Claim instance.
 */
export interface ClaimArgs extends OptionTypeArgs {
  tokenId: bigint; // Unique identifier for the claim.
  // TODO(Just use one enum for all of these)
  tokenType: 0 | 2; // Token type, where 0 indicates a redeemable claim.
}

/**
 * Represents a redeemable claim in the Valorem Clear system, which can be redeemed
 * for the underlying asset post option expiry.
 */
export class Claim extends OptionType {
  public tokenId: bigint;
  // TODO(Just use one enum for all of these)
  public tokenType: 0 | 2;

  /**
   * Constructs a Claim instance with the given arguments.
   */
  public constructor(args: ClaimArgs) {
    super(args);
    this.tokenId = args.tokenId;
    this.tokenType = args.tokenType;
  }

  /**
   * Redeems the claim for the underlying asset using the provided trader.
   * @param trader - The trader instance to execute the transaction.
   */
  public async redeemClaim(trader: Trader) {
    if (!this.tokenId) {
      console.log('Missing TokenId');
      return undefined;
    }
    // Prepare the transaction request for redeeming the claim.
    const { request } = await trader.clearinghouse.simulate.redeem([
      this.tokenId,
    ]);

    // Execute the transaction.
    const receipt = await trader.executeTransaction(
      request as SimulatedTxRequest,
    );

    // Log the result of the transaction.
    if (receipt.status === 'success') {
      console.log(
        `Successfully redeemed claim with ID ${this.tokenId.toString()}`,
      );
    }
  }

  /**
   * Checks if the claim has been redeemed based on the token type.
   * @returns - True if the claim has been redeemed, otherwise false.
   */
  public get redeemed() {
    // TODO(Just use one enum for all of these)
    return this.tokenType === 0;
  }

  /**
   * Static method to create a Claim instance from a claim ID.
   * @param claimId - The unique identifier for the claim.
   * @param clearinghouse - Instance of the ClearinghouseContract.
   * @returns - A Claim instance representing the redeemable claim.
   */
  static async fromId(claimId: bigint, clearinghouse: ClearinghouseContract) {
    // Determine the token type from the claim ID.
    const tokenType = await super.getTokenType(claimId, clearinghouse);
    if (tokenType === 1) {
      throw new Error(
        'The provided tokenId corresponds to an exercisable Option, not a redeemable Claim. Please use Option.fromId instead.',
      );
    }

    // Create an OptionType instance from the claim ID.
    const optionType = await super.fromId(claimId, clearinghouse);

    // Return a new Claim instance.
    return new this({
      optionInfo: optionType.optionInfo,
      optionTypeId: optionType.optionTypeId,
      typeExists: optionType.typeExists,
      tokenId: claimId,
      tokenType,
    });
  }
}

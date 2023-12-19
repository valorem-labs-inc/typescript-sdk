import type { Trader } from '../trader/base-trader';
import type { SimulatedTxRequest } from '../../types';
import type { ClearinghouseContract } from '../contracts/clearinghouse';
import type { OptionTypeArgs } from './option-type';
import { OptionType } from './option-type';

/**
 * Arguments required to construct an Option instance.
 */
export interface OptionArgs extends OptionTypeArgs {
  tokenId: bigint; // Unique identifier for the option.
  // TODO: we should just make an enum with 0, 1, 2
  tokenType: 0 | 1; // Token type, where 1 indicates an exercisable option.
}

/**
 * Represents an exercisable option in the Valorem Clear system.
 */
export class Option extends OptionType {
  public tokenId: bigint;
  public tokenType: 0 | 1;

  /**
   * Constructs an Option instance with the given arguments.
   */
  public constructor(args: OptionArgs) {
    super(args);
    this.tokenId = args.tokenId;
    this.tokenType = args.tokenType;
  }

  /**
   * Exercises the option for the specified amount using the provided trader.
   * @param amount - The amount of the option to exercise.
   * @param trader - The trader instance to execute the transaction.
   */
  public async exerciseOption({
    amount,
    trader,
  }: {
    amount: bigint;
    trader: Trader;
  }) {
    if (!this.tokenId) {
      console.log('Missing TokenId');
      return undefined;
    }
    // Prepare the transaction request for exercising the option.
    const { request } = await trader.clearinghouse.simulate.exercise([
      this.tokenId,
      amount,
    ]);

    // Execute the transaction.
    const receipt = await trader.executeTransaction(
      request as SimulatedTxRequest,
    );

    // Log the result of the transaction.
    if (receipt.status === 'success') {
      console.log(
        `Successfully exercised ${amount}x options, with ID ${this.tokenId.toString()}`,
      );
    }
  }

  /**
   * Static method to create an Option instance from a token ID.
   * @param optionId - The unique identifier for the option.
   * @param clearinghouse - The ClearinghouseContract instance to interact with the blockchain.
   * @returns An instance of Option.
   */
  static async fromId(optionId: bigint, clearinghouse: ClearinghouseContract) {
    // Determine the token type from the ID.
    const tokenType = await super.getTokenType(optionId, clearinghouse);
    if (tokenType === 2) {
      throw new Error(
        'The provided tokenId corresponds to a redeemable Claim, not an exercisable Option. Please use Claim.fromId instead.',
      );
    }

    // Create an OptionType instance from the ID.
    const optionType = await super.fromId(optionId, clearinghouse);

    // Return a new Option instance.
    return new this({
      optionInfo: optionType.optionInfo,
      optionTypeId: optionType.optionTypeId,
      typeExists: optionType.typeExists,
      tokenId: optionId,
      tokenType,
    });
  }
}

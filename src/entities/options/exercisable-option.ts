import type { Trader } from '../trader/base-trader';
import type { SimulatedTxRequest } from '../../types';
import type { ClearinghouseContract } from '../contracts';
import type { OptionTypeArgs } from './option-type';
import { OptionType } from './option-type';

export interface OptionArgs extends OptionTypeArgs {
  tokenId: bigint;
  tokenType: 0 | 1;
}

export class Option extends OptionType {
  public tokenId: bigint;
  public tokenType: 0 | 1;

  public constructor(args: OptionArgs) {
    super(args);
    this.tokenId = args.tokenId;
    this.tokenType = args.tokenType;
  }

  public async exerciseOption({
    amount,
    trader,
  }: {
    amount: bigint;
    trader: Trader;
  }) {
    if (!this.tokenId) {
      this.logger.error('Missing TokenId');
      return undefined;
    }
    // prepare tx
    const { request } = await trader.clearinghouse.simulate.exercise([
      this.tokenId,
      amount,
    ]);
    // send tx
    const receipt = await trader.executeTransaction(
      request as SimulatedTxRequest,
    );
    // check result
    if (receipt.status === 'success') {
      this.logger.info(
        `Successfully exercised ${amount}x options, with ID ${this.tokenId.toString()}`,
      );
    }
  }

  static async fromId(optionId: bigint, clearinghouse: ClearinghouseContract) {
    const tokenType = await super.getTokenType(optionId, clearinghouse);
    if (tokenType === 2) {
      throw new Error(
        'The provided tokenId corresponds to a redeemable Claim, not an exercisable Option. Please use Claim.fromId instead.',
      );
    }
    const optionType = await super.fromId(optionId, clearinghouse);
    return new this({
      optionInfo: optionType.optionInfo,
      optionTypeId: optionType.optionTypeId,
      typeExists: optionType.typeExists,
      tokenId: optionId,
      tokenType,
    });
  }
}

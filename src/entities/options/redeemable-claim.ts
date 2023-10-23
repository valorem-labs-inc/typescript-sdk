import type { Trader } from '../trader/base-trader';
import type { SimulatedTxRequest } from '../../types';
import type { ClearinghouseContract } from '../contracts';
import type { OptionTypeArgs } from './option-type';
import { OptionType } from './option-type';

export interface ClaimArgs extends OptionTypeArgs {
  tokenId: bigint;
  tokenType: 0 | 2;
}

export class Claim extends OptionType {
  public tokenId: bigint;
  public tokenType: 0 | 2;

  public constructor(args: ClaimArgs) {
    super(args);
    this.tokenId = args.tokenId;
    this.tokenType = args.tokenType;
  }

  public async redeemClaim(trader: Trader) {
    if (!this.tokenId) {
      console.log('Missing TokenId');
      return undefined;
    }
    // prepare tx
    const { request } = await trader.clearinghouse.simulate.redeem([
      this.tokenId,
    ]);
    // send tx
    const receipt = await trader.executeTransaction(
      request as SimulatedTxRequest,
    );
    // check result
    if (receipt.status === 'success') {
      console.log(
        `Successfully redeemed claim with ID ${this.tokenId.toString()}`,
      );
    }
  }

  public get redeemed() {
    return this.tokenType === 0;
  }

  static async fromId(claimId: bigint, clearinghouse: ClearinghouseContract) {
    const tokenType = await super.getTokenType(claimId, clearinghouse);
    if (tokenType === 1) {
      throw new Error(
        'The provided tokenId corresponds to an exercisable Option, not a redeemable Claim. Please use Option.fromId instead.',
      );
    }
    const optionType = await super.fromId(claimId, clearinghouse);
    return new this({
      optionInfo: optionType.optionInfo,
      optionTypeId: optionType.optionTypeId,
      typeExists: optionType.typeExists,
      tokenId: claimId,
      tokenType,
    });
  }
}

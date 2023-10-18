import type { Trader } from '../trader/base-trader';
import type { SimulatedTxRequest } from '../../types';
import type { ClearinghouseContract } from '../contracts';
import { OptionType } from './option-type';

export class Claim extends OptionType {
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

  static async fromId(claimId: bigint, clearinghouse: ClearinghouseContract) {
    const type = await super.fromId(claimId, clearinghouse);
    return new this({
      optionInfo: type.optionInfo,
      optionTypeId: type.optionTypeId,
      tokenId: type.tokenId,
      tokenType: type.tokenType,
    });
  }
}

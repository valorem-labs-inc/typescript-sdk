import type { Trader } from '../trader/base-trader';
import type { SimulatedTxRequest } from '../../types';
import { OptionType } from './option-type';
import { ClearinghouseContract } from '../contracts';

export class Option extends OptionType {
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
      console.log(
        `Successfully exercised ${amount}x options, with ID ${this.tokenId.toString()}`,
      );
    }
  }

  static async fromId(optionId: bigint, clearinghouse: ClearinghouseContract) {
    const type = await super.fromId(optionId, clearinghouse);
    return new this({
      optionInfo: type.optionInfo,
      optionTypeId: type.optionTypeId,
      tokenId: type.tokenId,
      tokenType: type.tokenType,
    });
  }
}

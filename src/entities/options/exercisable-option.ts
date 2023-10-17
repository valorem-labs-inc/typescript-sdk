import type { PublicClient } from '@wagmi/core';
import type { Trader } from '../trader/base-trader';
import type { SimulatedTxRequest } from '../../types';
import { OptionType } from './option-type';

export class Option extends OptionType {
  constructor({
    optionId,
    publicClient,
  }: {
    optionId: bigint;
    publicClient: PublicClient;
  }) {
    super({ tokenId: optionId, publicClient });
  }

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
    const { request } = await this.clearinghouse.simulate.exercise([
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
}
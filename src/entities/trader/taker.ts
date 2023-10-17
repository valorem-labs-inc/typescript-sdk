import { toH160, toH256, CLEAR_ADDRESS, nullBytes32 } from '../../utils';
import type { SeaportContract } from '../contracts/seaport';
import type { ParsedQuoteResponse } from '../../utils';
import { QuoteRequest, ItemType, Action } from '../../lib';
import type { SimulatedTxRequest } from '../../types';
import { Trader } from './base-trader';
import type { TraderConstructorArgs } from './base-trader';

export class Taker extends Trader {
  public constructor(args: TraderConstructorArgs) {
    super(args);
  }

  public createQuoteRequest({
    optionId,
    quantityToBuy,
  }: {
    optionId: bigint;
    quantityToBuy: number;
  }) {
    return new QuoteRequest({
      takerAddress: toH160(this.account.address),
      itemType: ItemType.ERC1155,
      tokenAddress: toH160(CLEAR_ADDRESS),
      identifierOrCriteria: toH256(optionId),
      amount: toH256(quantityToBuy),
      action: Action.BUY,
    });
  }

  public async acceptQuote({
    quote,
    seaport,
  }: {
    quote: ParsedQuoteResponse;
    seaport: SeaportContract;
  }) {
    // prepare tx
    const { parameters, signature } = quote.order;
    const { request } = await seaport.simulate.fulfillOrder([
      { parameters, signature },
      nullBytes32,
    ]);
    // send tx
    const receipt = await this.executeTransaction(
      request as SimulatedTxRequest,
    );
    // check result
    if (receipt.status === 'success') {
      console.log('Successfully fulfilled RFQ.');
    }
  }
}

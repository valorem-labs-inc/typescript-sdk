import type { PublicClient } from '@wagmi/core';
import type { Trader } from '../trader/base-trader';
import type { SimulatedTxRequest } from '../../types';
import { OptionType } from './option-type';

export class Claim extends OptionType {
  constructor({
    claimId,
    publicClient,
  }: {
    claimId: bigint;
    publicClient: PublicClient;
  }) {
    super({ tokenId: claimId, publicClient });
  }

  public async redeemClaim(trader: Trader) {
    if (!this.tokenId) {
      console.log('Missing TokenId');
      return undefined;
    }
    // prepare tx
    const { request } = await this.clearinghouse.simulate.redeem([
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
}

import type { Chain, PrivateKeyAccount, Account, LocalAccount } from 'viem';
import { arbitrum, arbitrumGoerli } from 'viem/chains';
import type { PublicClient, WalletClient } from '@wagmi/core';
import {
  Taker,
  Maker,
  ClearinghouseContract,
  SeaportContract,
} from './entities';

interface SDKOptions {
  publicClient: PublicClient;
  walletClient?: WalletClient;
}

export class ValoremSDK {
  public chain: Chain;
  public publicClient: PublicClient;

  public clearinghouse: ClearinghouseContract;
  public seaport: SeaportContract;

  public walletClient?: WalletClient;
  public account?: Account;
  public maker?: Maker;
  public taker?: Taker;

  constructor({ publicClient, walletClient }: SDKOptions) {
    const isSupportedNetwork =
      publicClient.chain.id === arbitrum.id ||
      publicClient.chain.id === arbitrumGoerli.id;
    if (!isSupportedNetwork) {
      throw new Error(
        `Unsupported network: ${publicClient.chain.name}. Please use Arbitrum or Arbitrum Goerli`,
      );
    }

    this.chain = publicClient.chain;
    this.publicClient = publicClient;

    if (walletClient) {
      this.walletClient = walletClient;
      this.account = walletClient.account;

      if (
        (this.account as LocalAccount<'privateKey' | 'custom'>).source ===
        'privateKey'
      ) {
        this.taker = new Taker({
          chain: this.chain,
          account: this.account as PrivateKeyAccount,
        });

        this.maker = new Maker({
          chain: this.chain,
          account: this.account as PrivateKeyAccount,
        });
      }
    }

    this.clearinghouse = new ClearinghouseContract({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    });

    this.seaport = new SeaportContract({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    });
  }
}

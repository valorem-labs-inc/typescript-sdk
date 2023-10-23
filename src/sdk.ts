import type { Chain, PrivateKeyAccount, Account, LocalAccount } from 'viem';
import { arbitrum, arbitrumGoerli } from 'viem/chains';
import type { PublicClient, WalletClient } from '@wagmi/core';
import { ClearinghouseContract, SeaportContract, WebTaker } from './entities';
import { Maker } from './entities/trader/maker';
import { Taker } from './entities/trader/taker';

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

  private _maker?: Maker;
  private _taker?: Taker;
  private _webTaker?: WebTaker;

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
        this._taker = new Taker({
          chain: this.chain,
          account: this.account as PrivateKeyAccount,
        });

        this._webTaker = new WebTaker({
          chain: this.chain,
          account: this.account as PrivateKeyAccount,
        });

        this._maker = new Maker({
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

  public get webTaker() {
    if (this._webTaker === undefined)
      throw new Error(
        'Failed to get WebTaker. Please initialize Valorem SDK with a wallet client to access WebTaker.',
      );

    return this._webTaker;
  }

  public get taker() {
    if (this._taker === undefined)
      throw new Error(
        'Failed to get Taker. Please initialize Valorem SDK with a wallet client to access Taker.',
      );

    return this._taker;
  }

  public get maker() {
    if (this._maker === undefined)
      throw new Error(
        'Failed to get Maker. Please initialize Valorem SDK with a wallet client to access Maker.',
      );

    return this._maker;
  }
}

import type { Chain, PrivateKeyAccount, Account, LocalAccount } from 'viem';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import type { PublicClient, WalletClient } from '@wagmi/core';
import { SeaportContract } from './entities/contracts/seaport';
import { ClearinghouseContract } from './entities/contracts/clearinghouse';
import { WebTaker } from './entities/trader/web-taker';
import { Maker } from './entities/trader/maker';
import { Taker } from './entities/trader/taker';
import type { ValoremGRPCClients } from './grpc/clients';

interface ViemClients {
  publicClient: PublicClient;
  walletClient?: WalletClient;
}

type SDKOptions = ViemClients & ValoremGRPCClients;

/**
 * Constructs a ValoremSDK instance with the provided clients and configurations.
 * It initializes essential components such as Clearinghouse and Seaport contracts,
 * and trader instances like Maker, Taker, and WebTaker.
 */
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

  constructor({
    publicClient,
    walletClient,
    authClient,
    rfqClient,
  }: SDKOptions) {
    const isSupportedNetwork =
      publicClient.chain.id === arbitrum.id ||
      publicClient.chain.id === arbitrumSepolia.id;
    if (!isSupportedNetwork) {
      throw new Error(
        `Unsupported network: ${publicClient.chain.name}. Please use Arbitrum or Arbitrum Sepolia`,
      );
    }

    this.chain = publicClient.chain;
    this.publicClient = publicClient;

    // TODO(I probably only want to instantiate 1/3 of these for a given use case)
    // There should be an ergonomic way to instantiate the SDK with only the functionality you need
    if (walletClient) {
      this.walletClient = walletClient;
      this.account = walletClient.account;

      if (
        authClient &&
        rfqClient &&
        (this.account as LocalAccount<'privateKey' | 'custom'>).source ===
          'privateKey'
      ) {
        this._taker = new Taker({
          chain: this.chain,
          account: this.account as PrivateKeyAccount,
          authClient,
          rfqClient,
        });

        this._webTaker = new WebTaker({
          chain: this.chain,
          account: this.account as PrivateKeyAccount,
          authClient,
          rfqClient,
        });

        this._maker = new Maker({
          chain: this.chain,
          account: this.account as PrivateKeyAccount,
          authClient,
          rfqClient,
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

  /**
   * Accessor for the WebTaker instance, providing functionalities for web-based trading.
   * @returns An instance of WebTaker.
   */
  public get webTaker() {
    if (this._webTaker === undefined)
      throw new Error(
        'Failed to get WebTaker. Please initialize Valorem SDK with a wallet client to access WebTaker.',
      );

    return this._webTaker;
  }

  /**
   * Accessor for the Taker instance, handling RFQs and trading operations.
   * @returns An instance of Taker.
   */
  public get taker() {
    if (this._taker === undefined)
      throw new Error(
        'Failed to get Taker. Please initialize Valorem SDK with a wallet client to access Taker.',
      );

    return this._taker;
  }

  // TODO(This is not yet implemented, we should probably remove it)
  /**
   * Accessor for the Maker instance, enabling market-making functionalities.
   * @returns An instance of Maker.
   */
  public get maker() {
    if (this._maker === undefined)
      throw new Error(
        'Failed to get Maker. Please initialize Valorem SDK with a wallet client to access Maker.',
      );

    return this._maker;
  }
}

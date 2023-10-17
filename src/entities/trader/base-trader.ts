import type {
  Address,
  PrivateKeyAccount,
  Chain,
  Account,
  LocalAccount,
} from 'viem';
import {
  createPublicClient,
  http,
  createWalletClient,
  publicActions,
  parseUnits,
  hexToBigInt,
} from 'viem';
import type { PublicClient, WalletClient } from '@wagmi/core';
import type { ERC20Contract } from '../contracts/erc20';
import type { SimulatedTxRequest } from '../../types';
import type { ParsedQuoteResponse } from '../../utils';
import {
  handleGRPCRequest,
  authClient,
  createSIWEMessage,
  toH256,
  toH160,
} from '../../utils';
import { nullBytes32, CLEAR_ADDRESS, SEAPORT_ADDRESS } from '../../constants';
import type { Claim, Option } from '../options';
import { ClearinghouseContract, SeaportContract } from '../contracts';
import { Action, QuoteRequest } from '../../lib/codegen/rfq_pb';
import { ItemType } from '../../lib/codegen/seaport_pb';

export interface TraderConstructorArgs {
  account: Account;
  chain: Chain;
}

export class Trader {
  public account: Account;
  public chain: Chain;
  public authenticated = false;
  public publicClient: PublicClient;
  public walletClient: WalletClient;
  public seaport: SeaportContract;
  public clearinghouse: ClearinghouseContract;

  /** cached results */
  // { [ERC20_ADDRESS]: BALANCE}
  private erc20Balances = new Map<Address, bigint>();
  // { [ERC20_ADDRESS]: { [CLEAR_ADDRESS]: APPROVED_AMOUNT, [SEAPORT_ADDRESS]: APPROVED_AMOUNT } }
  private erc20Allowances = new Map<
    Address,
    {
      [CLEAR_ADDRESS]?: bigint;
      [SEAPORT_ADDRESS]?: bigint;
    }
  >();

  public constructor({ account, chain }: TraderConstructorArgs) {
    this.publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    this.chain = chain;
    this.account = account;
    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(),
    }).extend(publicActions) as typeof this.walletClient;

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
   * Authenticate with Valorem Trade API via SIWE
   */
  public async signIn() {
    // check if already authenticated, early return if true
    if (this.authenticated) return;

    /**
     * 1. Get session nonce
     * 2. Create and sign SIWE message
     * 3. Submit verification to Valorem Trade API
     */
    const nonce = await this.getNonce();
    const { message, signature } = await this.createAndSignMessage(nonce);
    const { verified } = await this.verifyWithSIWE(message, signature);

    if (verified) {
      this.authenticated = true;
      console.log('Client has authenticated with Valorem Trade API!');
    } else {
      this.authenticated = false;
      console.log('SIWE Verification failed.');
    }
  }

  public async getNonce() {
    const res = await handleGRPCRequest(async () => authClient.nonce({}));
    if (res === null) throw new Error('Failed to get nonce for SIWE message.');
    return res.nonce;
  }

  public async checkAuthentication() {
    const res = await handleGRPCRequest(async () =>
      authClient.authenticate({}),
    );
    this.authenticated = res !== null;
  }

  public async verifyWithSIWE(message: string, signature: `0x${string}`) {
    const res = await handleGRPCRequest(async () =>
      authClient.verify({
        body: JSON.stringify({
          message,
          signature,
        }),
      }),
    );
    return { verified: res !== null };
  }

  public async createAndSignMessage(nonce: string) {
    if (!(this.account as PrivateKeyAccount | undefined)?.signMessage) {
      throw new Error('Account does not support signing messages.');
    }
    const message = createSIWEMessage({
      nonce,
      chainId: this.chain.id,
      address: this.account.address,
    });
    const signature = await (this.account as LocalAccount).signMessage({
      message,
    });
    return { message, signature };
  }

  public createQuoteRequest({
    optionId,
    quantityToBuy,
  }: {
    optionId: bigint;
    quantityToBuy: number;
  }) {
    return new QuoteRequest({
      ulid: undefined,
      chainId: toH256(BigInt(this.chain.id)),
      seaportAddress: toH160(hexToBigInt(SEAPORT_ADDRESS)),
      takerAddress: toH160(this.account.address),
      itemType: ItemType.ERC1155,
      tokenAddress: toH160(CLEAR_ADDRESS),
      identifierOrCriteria: toH256(optionId),
      amount: toH256(quantityToBuy),
      action: Action.BUY,
    });
  }

  /**
   * Contract Reads
   */
  public hasEnoughERC20Balance = async ({
    erc20,
    amount,
  }: {
    erc20: ERC20Contract;
    amount: bigint;
  }) => {
    const balance = await this.getBalanceOf(erc20);
    return balance >= amount;
  };

  public hasEnoughERC20Allowance = async ({
    erc20,
    spender,
    amount,
  }: {
    erc20: ERC20Contract;
    spender: typeof CLEAR_ADDRESS | typeof SEAPORT_ADDRESS;
    amount: bigint;
  }) => {
    const approvedAmount = await this.getAllowanceFor({ erc20, spender });
    return approvedAmount >= amount;
  };

  private getBalanceOf = async (erc20: ERC20Contract): Promise<bigint> => {
    const cachedBalance = this.erc20Balances.get(erc20.address);
    if (cachedBalance) {
      return cachedBalance;
    }
    const balance = await erc20.read.balanceOf([this.account.address]);
    this.erc20Balances.set(erc20.address, balance);
    return balance;
  };

  private getAllowanceFor = async ({
    erc20,
    spender,
  }: {
    erc20: ERC20Contract;
    spender: typeof CLEAR_ADDRESS | typeof SEAPORT_ADDRESS;
  }) => {
    const cachedAllowance = this.erc20Allowances.get(erc20.address)?.[spender];
    if (cachedAllowance) {
      return cachedAllowance;
    }
    const allowance = await erc20.read.allowance([
      this.account.address,
      spender,
    ]);
    this.erc20Allowances.set(erc20.address, {
      ...this.erc20Allowances.get(erc20.address),
      [spender]: allowance,
    });
    return allowance;
  };

  /**
   * Contract Writes
   */
  public async approveERC20({
    erc20,
    spender,
    amount,
  }: {
    erc20: ERC20Contract;
    spender: Address;
    amount: bigint;
  }) {
    // prepare tx
    const { request } = await erc20.simulate.approve([spender, amount]);
    // send tx
    const receipt = await this.executeTransaction(
      request as SimulatedTxRequest,
    );
    // check result
    if (receipt.status === 'success') {
      console.log(
        `Successfully approved ${spender} for ${parseUnits(
          amount.toString(),
          erc20.decimals,
        )} ${erc20.symbol}`,
      );
    }
  }

  public async exerciseOption({
    option,
    amount,
  }: {
    option: Option;
    amount: bigint;
  }) {
    await option.exerciseOption({
      amount,
      trader: this,
    });
  }

  public async redeemClaim({ claim }: { claim: Claim }) {
    await claim.redeemClaim(this);
  }

  public async acceptQuote({ quote }: { quote: ParsedQuoteResponse }) {
    if (!this.seaport.write)
      throw new Error('Must initialize Seaport with Wallet Client');

    const { parameters, signature } = quote.order;
    try {
      // send tx (simulating will fail)
      const hash = await this.seaport.write.fulfillOrder([
        { parameters, signature },
        nullBytes32,
      ]);
      // get receipt
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
      });
      // check result
      if (receipt.status === 'success') {
        console.log('Successfully fulfilled RFQ.');
      }
    } catch (error) {
      console.log(
        `Failed to accept quote.`,
        error,
        `Checking order validity...`,
      );
      const errorsAndWarnings = await this.seaport.validator.read.isValidOrder([
        { parameters, signature },
        SEAPORT_ADDRESS,
      ]);
      console.log(
        { errorsAndWarnings },
        'Learn more at https://github.com/ProjectOpenSea/seaport/blob/main/docs/OrderValidator.md',
      );
    }
  }

  public async executeTransaction(request: SimulatedTxRequest) {
    // submit tx to chain
    const hash = await this.walletClient.writeContract(request);
    // wait for tx to be mined
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
    });
    // throw error with txHash if tx failed
    if (receipt.status === 'reverted') {
      throw new Error(`Transaction failed. Hash: ${receipt.transactionHash}`);
    }
    return receipt;
  }
}

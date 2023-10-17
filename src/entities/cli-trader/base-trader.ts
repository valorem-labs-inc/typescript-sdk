import type {
  PublicClient,
  Address,
  PrivateKeyAccount,
  Transport,
  Chain,
  WalletClient,
  Account,
  LocalAccount,
} from 'viem';
import {
  createPublicClient,
  http,
  createWalletClient,
  publicActions,
  parseUnits,
} from 'viem';
import type { ERC20Contract } from '../contracts/erc20';
import type { SimulatedTxRequest } from '../../types';
import { handleGRPCRequest, authClient, createSIWEMessage, fromH160ToAddress } from '../../utils';
import type { CLEAR_ADDRESS, SEAPORT_ADDRESS } from '../../constants';
import type { ClearinghouseContract } from '../contracts/clearinghouse';

export interface TraderConstructorArgs {
  account: Account;
  chain: Chain;
}

export class Trader {
  public account: Account;
  public chain: Chain;
  public authenticated = false;
  public publicClient: PublicClient<Transport, Chain>;
  public walletClient: WalletClient;

  /** cached results */
  private erc20Balances = new Map<Address, bigint>();
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

    this.account = account;
    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(),
    }).extend(publicActions) as typeof this.walletClient;

    this.chain = chain;
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
    if (res) this.authenticated = fromH160ToAddress(res).toLowerCase() === this.account.address.toLowerCase()
    return this.authenticated;
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
    if (res) return {verified: fromH160ToAddress(res).toLowerCase() === this.account.address.toLowerCase()}
    return { verified: null };
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
    spender: typeof CLEAR_ADDRESS;
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
    spender: typeof CLEAR_ADDRESS;
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
    optionId,
    amount,
    clearinghouse,
  }: {
    optionId: bigint;
    amount: bigint;
    clearinghouse: ClearinghouseContract;
  }) {
    // prepare tx
    const { request } = await clearinghouse.simulate.exercise([
      optionId,
      amount,
    ]);
    // send tx
    const receipt = await this.executeTransaction(
      request as SimulatedTxRequest,
    );
    // check result
    if (receipt.status === 'success') {
      console.log(
        `Successfully exercised ${amount}x options, with ID ${optionId.toString()}`,
      );
    }
  }

  public async redeemClaim({
    optionId,
    clearinghouse,
  }: {
    optionId: bigint;
    clearinghouse: ClearinghouseContract;
  }) {
    // prepare tx
    const { request } = await clearinghouse.simulate.redeem([optionId]);
    // send tx
    const receipt = await this.executeTransaction(
      request as SimulatedTxRequest,
    );
    // check result
    if (receipt.status === 'success') {
      console.log(`Successfully redeemed claim with ID ${optionId.toString()}`);
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

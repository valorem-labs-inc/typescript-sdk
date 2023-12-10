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
import type { PartialMessage } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { ERC20Contract } from '../contracts/erc20';
import type { SimulatedTxRequest } from '../../types';
import {
  parseQuoteResponse,
  toH256,
  toH160,
  fromH160ToAddress,
  handleGRPCRequest,
  type AuthClient,
  type FeesClient,
  type RFQClient,
  type SpotClient,
  type ParsedQuoteResponse,
  type ValoremGRPCClients,
} from '../../grpc';
import { createSIWEMessage } from '../../utils';
import { CLEAR_ADDRESS, SEAPORT_ADDRESS, NULL_BYTES32 } from '../../constants';
import { ClearinghouseContract, SeaportContract } from '../contracts';
import { Action, QuoteRequest } from '../../lib/codegen/rfq_pb';
import { ItemType } from '../../lib/codegen/seaport_pb';

/**
 * Constructor arguments for creating a Trader instance.
 */
export interface TraderConstructorArgs extends ValoremGRPCClients {
  account: Account;
  chain: Chain;
  authClient: AuthClient;
  rfqClient: RFQClient;
}

type Spender = typeof CLEAR_ADDRESS | typeof SEAPORT_ADDRESS;

/**
 * The Trader class encapsulates trading functionalities within the Valorem SDK.
 * It includes methods for authentication, RFQ handling, and interacting with
 * various contracts like ERC20, Clearinghouse, and Seaport.
 */
export class Trader {
  public account: Account;
  public chain: Chain;
  public authenticated = false;
  public publicClient: PublicClient;
  public walletClient: WalletClient;
  public seaport: SeaportContract;
  public clearinghouse: ClearinghouseContract;

  public authClient: AuthClient;
  private feesClient?: FeesClient;
  public rfqClient: RFQClient;
  private spotClient?: SpotClient;

  /** cached results */
  private erc20Balances = new Map<Address, bigint>();
  private erc20Allowances = new Map<
    Address,
    {
      [CLEAR_ADDRESS]?: bigint;
      [SEAPORT_ADDRESS]?: bigint;
    }
  >();

  /**
   * Constructs a new Trader instance with the given Valorem GRPC clients and
   * blockchain account details. It sets up clients for public and wallet interactions,
   * as well as initializing contracts for trading operations.
   */
  public constructor({
    account,
    chain,
    authClient,
    feesClient,
    rfqClient,
    spotClient,
  }: TraderConstructorArgs) {
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

    this.authClient = authClient;
    this.feesClient = feesClient;
    this.rfqClient = rfqClient;
    this.spotClient = spotClient;
  }

  /**
   * Authenticates the trader with the Valorem Trade API using SIWE (Sign-In with Ethereum).
   * This process involves getting a session nonce, creating and signing a SIWE message,
   * and submitting the verification to Valorem Trade API.
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

  /**
   * Retrieves a nonce for SIWE authentication.
   * @returns - A promise that resolves to the nonce.
   */
  public async getNonce() {
    const res = await handleGRPCRequest(async () => this.authClient.nonce({}));
    if (res === null) throw new Error('Failed to get nonce for SIWE message.');
    return res.nonce;
  }

  /**
   * Checks if the trader is currently authenticated.
   * @returns - A promise indicating authentication status.
   */
  public async checkAuthentication() {
    const res = await handleGRPCRequest(async () =>
      this.authClient.authenticate({}),
    );
    if (res)
      this.authenticated =
        fromH160ToAddress(res).toLowerCase() ===
        this.account.address.toLowerCase();
    return this.authenticated;
  }

  /**
   * Verifies the signed SIWE message for authentication.
   * @param message - The signed message.
   * @param signature - The signature of the message.
   * @returns - A promise with the verification result.
   */
  public async verifyWithSIWE(message: string, signature: `0x${string}`) {
    const res = await handleGRPCRequest(async () =>
      this.authClient.verify({
        body: JSON.stringify({
          message,
          signature,
        }),
      }),
    );
    if (res)
      return {
        verified:
          fromH160ToAddress(res).toLowerCase() ===
          this.account.address.toLowerCase(),
      };
    return { verified: null };
  }

  /**
   * Creates and signs a SIWE message for authentication.
   * @param nonce - The nonce to use in the message.
   * @returns - A promise with the message and its signature.
   */
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
   * Creates a new quote request for trading options. This method is used to generate
   * the request payload for an RFQ, specifying details such as the option ID, quantity,
   * and other relevant parameters.
   */
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
   * Opens a stream for RFQs, continuously sending requests and handling responses.
   * This method is a key part of the trading process, allowing the trader to interact
   * with market makers and receive quotes for option trades.
   */
  public async openRFQStream<TMethod extends 'taker' | 'webTaker'>({
    method,
    request,
    onQuoteResponse,
    options,
  }: {
    method: TMethod;
    request: TMethod extends 'webTaker'
      ? PartialMessage<QuoteRequest>
      : () => AsyncIterable<PartialMessage<QuoteRequest>>;
    onQuoteResponse: (quoteResponse: ParsedQuoteResponse) => void;
    options?: { signal?: AbortSignal; timeoutMs: number };
  }) {
    // continuously send requests and handle responses
    console.log('Sending RFQs');

    try {
      for await (const quoteResponse of method === 'taker'
        ? this.rfqClient.taker(
            (request as () => AsyncIterable<PartialMessage<QuoteRequest>>)(),
            options,
          )
        : this.rfqClient.webTaker(
            request as PartialMessage<QuoteRequest>,
            options,
          )) {
        if (Object.keys(quoteResponse).length === 0) {
          if (method === 'webTaker') {
            console.log('Received an empty quote response');
          }
          continue;
        }
        if (!quoteResponse.order || !quoteResponse.seaportAddress) {
          console.log('Received an invalid quote response');
          continue;
        }
        // parse the response
        try {
          const parsedQuoteResponse = parseQuoteResponse(quoteResponse);
          console.log('Received a valid quote response!');
          onQuoteResponse(parsedQuoteResponse);
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      if (error instanceof ConnectError) {
        const connectError = ConnectError.from(error);
        if (!connectError.rawMessage.includes('This operation was aborted')) {
          console.log(error);
        }
      }
    }
    console.log('Stream closed');
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
    spender: Spender;
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
    spender: Spender;
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
    tokenAddress,
    spender,
    amount,
  }: {
    tokenAddress: Address;
    spender: Address;
    amount: bigint;
  }) {
    const erc20 = new ERC20Contract({
      address: tokenAddress,
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    });

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

  public async acceptQuote({ quote }: { quote: ParsedQuoteResponse }) {
    if (!this.seaport.write)
      throw new Error('Must initialize Seaport with Wallet Client');

    const { parameters, signature } = quote.order;
    try {
      // send tx (simulating will fail)
      const hash = await this.seaport.write.fulfillOrder([
        { parameters, signature },
        NULL_BYTES32,
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

  /**
   * Executes a given transaction request. This method is crucial for submitting
   * and confirming blockchain transactions as part of trading operations, such as
   * option exercises, claim redemptions, and accepting quotes.
   *
   * @param request - The simulated transaction request.
   * @returns - A promise with the transaction receipt.
   */
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

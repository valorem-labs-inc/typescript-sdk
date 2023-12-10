import { erc20ABI } from '@wagmi/core';
import type { ContractConstructorArgs, IERC20 } from './base-contract';
import { Contract } from './base-contract';

/**
 * Extends the generic Contract class to interface specifically with ERC20 tokens.
 * It provides properties and methods to interact with the standard ERC20 functions.
 */
export class ERC20Contract extends Contract<IERC20> {
  private _symbol?: string;
  private _decimals?: number;

  /**
   * Initializes a new instance of the ERC20Contract with the provided arguments
   * and begins fetching the token's symbol and decimals for later use.
   *
   * @param args - Contains the contract address, publicClient, and optionally
   * walletClient for interaction with the ERC20 token contract.
   */
  public constructor(
    args: Pick<
      ContractConstructorArgs,
      'address' | 'publicClient' | 'walletClient'
    >,
  ) {
    super({ ...args, abi: erc20ABI });
    // Asynchronously fetch and set the symbol and decimals which are commonly used properties.
    void this.getSymbol();
    void this.getDecimals();
  }

  /**
   * Gets the token symbol if it has been set; otherwise, throws an error.
   * @returns - The symbol of the ERC20 token.
   */
  public get symbol() {
    if (!this._symbol) throw new Error('Symbol not set');
    return this._symbol;
  }

  /**
   * Gets the token decimals if they have been set; otherwise, throws an error.
   * @returns - The decimals of the ERC20 token.
   */
  public get decimals() {
    if (!this._decimals) throw new Error('Decimals not set');
    return this._decimals;
  }

  /**
   * Fetches the token symbol from the smart contract if not already cached.
   * @returns - A promise that resolves to the symbol of the ERC20 token.
   */
  private async getSymbol(): Promise<string> {
    if (!this._symbol) {
      this._symbol = await this.read.symbol();
    }
    return this._symbol;
  }

  /**
   * Fetches the token decimals from the smart contract if not already cached.
   * @returns - A promise that resolves to the decimals of the ERC20 token.
   */
  private async getDecimals(): Promise<number> {
    if (!this._decimals) {
      this._decimals = await this.read.decimals();
    }
    return this._decimals;
  }
}

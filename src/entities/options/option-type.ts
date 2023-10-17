import type { Address } from 'viem';
import {
  bytesToBigInt,
  encodeAbiParameters,
  keccak256,
  pad,
  sliceHex,
  toBytes,
} from 'viem';
import type { PublicClient } from '@wagmi/core';
import type { SimulatedTxRequest } from '../../types';
import type { Trader } from '../trader/base-trader';
import { ClearinghouseContract } from '../contracts/clearinghouse';

export interface OptionTypeInfo {
  underlyingAsset: Address;
  underlyingAmount: bigint;
  exerciseAsset: Address;
  exerciseAmount: bigint;
  exerciseTimestamp: number;
  expiryTimestamp: number;
}

type OptionTypeArgs =
  | {
      publicClient: PublicClient;
      optionInfo: OptionTypeInfo;
      tokenId?: undefined;
    }
  | {
      publicClient: PublicClient;
      tokenId: bigint;
      optionInfo?: undefined;
    };

export class OptionType {
  public publicClient: PublicClient;
  public clearinghouse: ClearinghouseContract;

  // Specific to OptionTypes
  public optionInfo?: OptionTypeInfo;

  // Specific to Options (Exercisable Options + Redeemable Claims)
  private _tokenId?: bigint;
  private _tokenType?: number;

  constructor({ optionInfo, tokenId, publicClient }: OptionTypeArgs) {
    this.publicClient = publicClient;
    this.clearinghouse = new ClearinghouseContract({ publicClient });
    // if passed option info directly, we can initialize immediately
    if (optionInfo !== undefined) {
      this.optionInfo = optionInfo;
      void this.init();
    } else {
      // otherwise if the ID is the only parameter, we must derive the rest asynchronously
      this._tokenId = tokenId;
      void this.init(tokenId);
    }
  }

  public get optionTypeId() {
    if (!this.hashedParams) return undefined;
    const asBytes20 = toBytes(sliceHex(this.hashedParams, 0, 20), {
      size: 20,
    });
    const padded = pad(asBytes20, { dir: 'left', size: 32 });
    const optionTypeId = bytesToBigInt(padded) << BigInt(96);
    return optionTypeId;
  }

  public get tokenId() {
    if (this._tokenId) return this._tokenId;
    return this.optionTypeId;
  }

  public get typeExists() {
    if (this._tokenType === undefined) {
      void this.getTokenType();
      return undefined;
    }
    return this._tokenType !== 0;
  }

  public get tokenType() {
    if (!this._tokenType) {
      void this.getTokenType();
      return undefined;
    }
    return this._tokenType;
  }

  public async createOptionType(trader: Trader) {
    if (!this.optionInfo) {
      throw new Error('Option info not initialized');
    }

    console.log(
      `Initializing new OptionType with Clearinghouse. ID:${this.optionTypeId?.toString()}`,
    );
    // prepare tx
    const { request } = await this.clearinghouse.simulate.newOptionType([
      this.optionInfo.underlyingAsset,
      this.optionInfo.underlyingAmount,
      this.optionInfo.exerciseAsset,
      this.optionInfo.exerciseAmount,
      this.optionInfo.exerciseTimestamp,
      this.optionInfo.expiryTimestamp,
    ]);
    // send tx
    const receipt = await trader.executeTransaction(
      request as SimulatedTxRequest,
    );
    // check result
    if (receipt.status === 'success') {
      console.log(
        `Successfully created new option type. txHash: ${receipt.transactionHash}`,
      );
    }
  }

  private async getOptionTypeInfo(tokenId: bigint) {
    const _optionInfo = await this.clearinghouse.read.option([tokenId]);
    this.optionInfo = {
      underlyingAsset: _optionInfo.underlyingAsset,
      underlyingAmount: _optionInfo.underlyingAmount,
      exerciseAsset: _optionInfo.exerciseAsset,
      exerciseAmount: _optionInfo.exerciseAmount,
      exerciseTimestamp: _optionInfo.exerciseTimestamp,
      expiryTimestamp: _optionInfo.expiryTimestamp,
    };
  }

  private async getTokenType() {
    const id = this._tokenId ?? this.optionTypeId;
    if (!id) {
      console.log('Missing TokenId');
      return undefined;
    }
    const tokenType = await this.clearinghouse.read.tokenType([id]);
    this._tokenType = tokenType;
    return tokenType;
  }

  private get hashedParams() {
    if (!this.optionInfo) return undefined;
    const encoded = encodeAbiParameters(
      [
        { type: 'address', name: 'underlyingAsset' },
        { type: 'uint96', name: 'underlyingAmount' },
        { type: 'address', name: 'exerciseAsset' },
        { type: 'uint96', name: 'exerciseAmount' },
        { type: 'uint40', name: 'exerciseTimestamp' },
        { type: 'uint40', name: 'expiryTimestamp' },
      ],
      [
        this.optionInfo.underlyingAsset,
        this.optionInfo.underlyingAmount,
        this.optionInfo.exerciseAsset,
        this.optionInfo.exerciseAmount,
        this.optionInfo.exerciseTimestamp,
        this.optionInfo.expiryTimestamp,
      ],
    );
    return keccak256(encoded);
  }

  public get ready() {
    return this._tokenType !== undefined && this.optionInfo !== undefined;
  }

  private async init(tokenId?: bigint) {
    try {
      await this.getTokenType();
      if (tokenId) {
        await this.getOptionTypeInfo(tokenId);
      }
    } catch (err) {
      console.warn('Failed to initialize the optionType', { err });
    }
  }
}

import type { Address } from 'viem';
import {
  bytesToBigInt,
  encodeAbiParameters,
  keccak256,
  pad,
  sliceHex,
  toBytes,
} from 'viem';
import type { SimulatedTxRequest } from '../../types';
import type { Trader } from '../trader/base-trader';
import type { ClearinghouseContract } from '../contracts/clearinghouse';

export interface OptionTypeInfo {
  underlyingAsset: Address;
  underlyingAmount: bigint;
  exerciseAsset: Address;
  exerciseAmount: bigint;
  exerciseTimestamp: number;
  expiryTimestamp: number;
}

interface OptionTypeArgs {
  optionInfo: OptionTypeInfo;
  optionTypeId: bigint;
  tokenId: bigint;
  tokenType: 0 | 1 | 2;
}

export class OptionType {
  // Specific to OptionTypes
  public optionInfo: OptionTypeInfo;
  public optionTypeId: bigint;

  // Specific to Options (Exercisable Options + Redeemable Claims)
  public tokenId: bigint;
  public tokenType: 0 | 1 | 2;

  public constructor({
    optionInfo,
    optionTypeId,
    tokenId,
    tokenType,
  }: OptionTypeArgs) {
    this.optionInfo = optionInfo;
    this.optionTypeId = optionTypeId;
    this.tokenId = tokenId;
    this.tokenType = tokenType;
  }

  public get typeExists() {
    return this.tokenType !== 0;
  }

  public async createOptionType(trader: Trader) {
    console.log(
      `Initializing new OptionType with Clearinghouse. ID:${this.optionTypeId.toString()}`,
    );
    // prepare tx
    const { request } = await trader.clearinghouse.simulate.newOptionType([
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
      this.tokenType = 1;
    }
  }

  static async fromInfo({
    optionInfo,
    clearinghouse,
  }: {
    optionInfo: OptionTypeInfo;
    clearinghouse: ClearinghouseContract;
  }) {
    const optionTypeId = this.getOptionTypeId(optionInfo);
    const tokenType = await OptionType.getTokenType(
      optionTypeId,
      clearinghouse,
    );
    return new this({
      optionInfo,
      tokenId: optionTypeId,
      optionTypeId,
      tokenType,
    });
  }

  static async fromId({
    tokenId,
    clearinghouse,
  }: {
    tokenId: bigint;
    clearinghouse: ClearinghouseContract;
  }) {
    const optionInfo = await OptionType.getOptionTypeInfo(
      tokenId,
      clearinghouse,
    );
    const tokenType = await OptionType.getTokenType(tokenId, clearinghouse);
    const optionTypeId = OptionType.getOptionTypeId(optionInfo);

    return new this({
      optionInfo,
      optionTypeId,
      tokenId,
      tokenType,
    });
  }

  private static async getOptionTypeInfo(
    tokenId: bigint,
    clearinghouse: ClearinghouseContract,
  ) {
    return clearinghouse.read.option([tokenId]);
  }

  private static async getTokenType(
    tokenId: bigint,
    clearinghouse: ClearinghouseContract,
  ): Promise<0 | 1 | 2> {
    return clearinghouse.read.tokenType([tokenId]) as Promise<0 | 1 | 2>;
  }

  private static getOptionTypeId(info: OptionTypeInfo) {
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
        info.underlyingAsset,
        info.underlyingAmount,
        info.exerciseAsset,
        info.exerciseAmount,
        info.exerciseTimestamp,
        info.expiryTimestamp,
      ],
    );
    const hashedParams = keccak256(encoded);
    const asBytes20 = toBytes(sliceHex(hashedParams, 0, 20), {
      size: 20,
    });
    const padded = pad(asBytes20, { dir: 'left', size: 32 });
    const optionTypeId = bytesToBigInt(padded) << BigInt(96);
    return optionTypeId;
  }
}

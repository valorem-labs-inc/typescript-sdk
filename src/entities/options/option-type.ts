import {
  bytesToBigInt,
  encodeAbiParameters,
  keccak256,
  pad,
  sliceHex,
  toBytes,
} from 'viem';
import type { OptionTypeInfo, SimulatedTxRequest } from '../../types';
import type { Trader } from '../trader/base-trader';
import type { ClearinghouseContract } from '../contracts/clearinghouse';
import { SupportedAsset } from '../assets';
import { OptionAssetPair } from '../assets/asset-pair';

export interface OptionTypeArgs {
  optionInfo: OptionTypeInfo;
  optionTypeId: bigint;
  typeExists: boolean;
}

export class OptionType extends OptionAssetPair {
  // Specific to OptionTypes
  public optionInfo: OptionTypeInfo;
  public optionTypeId: bigint;
  public typeExists: boolean;

  // Specific to Options (Exercisable Options + Redeemable Claims)
  public tokenId: bigint | undefined = undefined;
  public tokenType: 0 | 1 | 2 | undefined = undefined;

  public constructor({ optionInfo, optionTypeId, typeExists }: OptionTypeArgs) {
    super({
      exerciseAsset: SupportedAsset.fromAddress(optionInfo.exerciseAsset),
      underlyingAsset: SupportedAsset.fromAddress(optionInfo.underlyingAsset),
    });
    this.optionInfo = optionInfo;
    this.optionTypeId = optionTypeId;
    this.typeExists = typeExists;
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
      this.typeExists = true;
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
      optionTypeId,
      typeExists: tokenType !== 0,
    });
  }

  static async fromId(tokenId: bigint, clearinghouse: ClearinghouseContract) {
    const optionInfo = await OptionType.getOptionTypeInfo(
      tokenId,
      clearinghouse,
    );
    const optionTypeId = OptionType.getOptionTypeId(optionInfo);
    const tokenType = await OptionType.getTokenType(
      optionTypeId,
      clearinghouse,
    );

    return new this({
      optionInfo,
      optionTypeId,
      typeExists: tokenType !== 0,
    });
  }

  protected static async getOptionTypeInfo(
    tokenId: bigint,
    clearinghouse: ClearinghouseContract,
  ) {
    return clearinghouse.read.option([tokenId]);
  }

  protected static async getTokenType(
    tokenId: bigint,
    clearinghouse: ClearinghouseContract,
  ): Promise<0 | 1 | 2> {
    return clearinghouse.read.tokenType([tokenId]) as Promise<0 | 1 | 2>;
  }

  protected static getOptionTypeId(info: OptionTypeInfo) {
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

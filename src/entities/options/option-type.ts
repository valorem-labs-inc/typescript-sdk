import {
  bytesToBigInt,
  encodeAbiParameters,
  keccak256,
  pad,
  sliceHex,
  toBytes,
} from 'viem';
import type {
  OptionTypeInfo,
  SimulatedTxRequest,
  SupportedChainId,
} from '../../types';
import type { Trader } from '../trader/base-trader';
import type { ClearinghouseContract } from '../contracts/clearinghouse';
import { SupportedAsset } from '../assets';
import { OptionAssetPair } from '../assets/asset-pair';
import type { SubgraphOptionType } from '../../lib/subgraph/types';

/**
 * Arguments required for constructing an OptionType instance.
 */
export interface OptionTypeArgs {
  optionInfo: OptionTypeInfo; // Information about the option type.
  optionTypeId: bigint; // Unique identifier for the option type.
  typeExists: boolean; // Flag to indicate if the option type already exists.
}

/**
 * Represents the type of option in the Valorem Clear system.
 */
export class OptionType extends OptionAssetPair {
  // Information about the option type.
  public optionInfo: OptionTypeInfo;
  // Unique identifier derived from the option information.
  public optionTypeId: bigint;
  // Indicates if the option type exists in the system.
  public typeExists: boolean;

  // Additional properties for options.
  public tokenId: bigint | undefined = undefined;
  // TODO(This should just be an enum, and never undefined)
  public tokenType: 0 | 1 | 2 | undefined = undefined;

  /**
   * Constructs an OptionType instance with the provided arguments.
   */
  public constructor({ optionInfo, optionTypeId, typeExists }: OptionTypeArgs) {
    super({
      exerciseAsset: SupportedAsset.fromAddress(optionInfo.exerciseAsset),
      underlyingAsset: SupportedAsset.fromAddress(optionInfo.underlyingAsset),
    });
    this.optionInfo = optionInfo;
    this.optionTypeId = optionTypeId;
    this.typeExists = typeExists;
  }

  /**
   * Creates a new option type on-chain using the trader instance.
   * @param trader - Trader instance to execute the transaction.
   */
  public async createOptionType(trader: Trader) {
    // Log initialization message
    console.log(
      `Initializing new OptionType with Clearinghouse. ID:${this.optionTypeId.toString()}`,
    );
    // Prepare the transaction request for creating the new option type.
    const { request } = await trader.clearinghouse.simulate.newOptionType([
      this.optionInfo.underlyingAsset,
      this.optionInfo.underlyingAmount,
      this.optionInfo.exerciseAsset,
      this.optionInfo.exerciseAmount,
      this.optionInfo.exerciseTimestamp,
      this.optionInfo.expiryTimestamp,
    ]);
    // Execute the transaction.
    const receipt = await trader.executeTransaction(
      request as SimulatedTxRequest,
    );
    // Log result and update type existence flag.
    if (receipt.status === 'success') {
      console.log(
        `Successfully created new option type. txHash: ${receipt.transactionHash}`,
      );
      this.typeExists = true;
    }
  }

  /**
   * Static method to create an OptionType instance from option information.
   * @param optionInfo - Information detailing the option type.
   * @param clearinghouse - Instance of the ClearinghouseContract.
   * @returns An instance of OptionType.
   */
  static async fromInfo({
    optionInfo,
    clearinghouse,
  }: {
    optionInfo: OptionTypeInfo;
    clearinghouse: ClearinghouseContract;
  }) {
    // Derive the option type ID from the option information.
    const optionTypeId = this.getOptionTypeId(optionInfo);
    // Check if the option type exists on-chain.
    const tokenType = await OptionType.getTokenType(
      optionTypeId,
      clearinghouse,
    );
    // Create and return the OptionType instance.
    return new this({
      optionInfo,
      optionTypeId,
      typeExists: tokenType !== 0,
    });
  }

  /**
   * Static method to create an OptionType instance from a token ID.
   * @param tokenId - The unique identifier for the option.
   * @param clearinghouse - Instance of the ClearinghouseContract.
   * @returns An instance of OptionType.
   */
  static async fromId(tokenId: bigint, clearinghouse: ClearinghouseContract) {
    // Retrieve option type information using the token ID.
    const optionInfo = await OptionType.getOptionTypeInfo(
      tokenId,
      clearinghouse,
    );
    // Derive the option type ID from the retrieved information.
    const optionTypeId = OptionType.getOptionTypeId(optionInfo);
    // Check if the option type exists on-chain.
    const tokenType = await OptionType.getTokenType(
      optionTypeId,
      clearinghouse,
    );
    // Create and return the OptionType instance.
    return new this({
      optionInfo,
      optionTypeId,
      typeExists: tokenType !== 0,
    });
  }

  static fromSubgraph({
    subgraphOptionType,
    chainId,
  }: {
    subgraphOptionType: SubgraphOptionType;
    chainId: SupportedChainId;
  }) {
    // get tokens
    const exerciseToken = SupportedAsset.getSupportedAssetsByChainId(
      chainId,
    ).find((token) => token.symbol === subgraphOptionType.exerciseAsset.symbol);
    const underlyingToken = SupportedAsset.getSupportedAssetsByChainId(
      chainId,
    ).find(
      (token) => token.symbol === subgraphOptionType.underlyingAsset.symbol,
    );

    if (!exerciseToken) throw new Error('Exercise token not found');
    if (!underlyingToken) throw new Error('Underlying token not found');

    // extract amounts and timestamps to pass to option constructor
    const underlyingAmount = BigInt(subgraphOptionType.underlyingAmount);
    const exerciseAmount = BigInt(subgraphOptionType.exerciseAmount);
    const exerciseTimestamp = Number(subgraphOptionType.exerciseTimestamp);
    const expiryTimestamp = Number(subgraphOptionType.expiryTimestamp);

    const optionInfo = {
      underlyingAsset: underlyingToken.address,
      underlyingAmount,
      exerciseAsset: exerciseToken.address,
      exerciseAmount,
      exerciseTimestamp,
      expiryTimestamp,
    };

    return new this({
      optionInfo,
      optionTypeId: BigInt(subgraphOptionType.id),
      typeExists: true,
    });
  }

  /**
   * Retrieves the option type information from the clearinghouse contract.
   * @param tokenId - The unique identifier of the option or claim.
   * @param clearinghouse - The clearinghouse contract instance.
   * @returns The option type information.
   */
  protected static async getOptionTypeInfo(
    tokenId: bigint,
    clearinghouse: ClearinghouseContract,
  ) {
    return clearinghouse.read.option([tokenId]);
  }

  /**
   * Determines the token type for the given ID by querying the clearinghouse.
   * @param tokenId - The unique identifier of the option or claim.
   * @param clearinghouse - The clearinghouse contract instance.
   * @returns The token type as a promise that resolves to 0, 1, or 2.
   */
  protected static async getTokenType(
    tokenId: bigint,
    clearinghouse: ClearinghouseContract,
  ): Promise<0 | 1 | 2> {
    return clearinghouse.read.tokenType([tokenId]) as Promise<0 | 1 | 2>;
  }

  /**
   * Generates a unique option type ID based on the provided option type information.
   * @param info - The information detailing the option type.
   * @returns The generated option type ID.
   */
  static getOptionTypeId(info: OptionTypeInfo) {
    // Encode the option type information into ABI parameters.
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
    // Hash the encoded parameters.
    const hashedParams = keccak256(encoded);
    // Convert the hash to a 20-byte value.
    const asBytes20 = toBytes(sliceHex(hashedParams, 0, 20), {
      size: 20,
    });
    // Pad the bytes to 32-byte and shift left by 96 bits to form the option type ID.
    const padded = pad(asBytes20, { dir: 'left', size: 32 });
    // TODO(This variable can be inlined)
    const optionTypeId = bytesToBigInt(padded) << BigInt(96);
    return optionTypeId;
  }
}

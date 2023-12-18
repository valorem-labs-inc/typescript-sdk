import { format, fromUnixTime, isAfter, isBefore } from 'date-fns';
import { parseUnits } from 'viem';
import type {
  SubgraphClaimERC1155,
  SubgraphOptionPosition,
  SubgraphOptionType,
} from '../../lib/subgraph/types';
import { BASE_SCALAR_BN } from '../../constants';
import { OptionType } from './option-type';

export class SubgraphPosition extends OptionType {
  private readonly rawPositionFromSubgraph: SubgraphOptionPosition;
  private readonly rawOptionTypeFromSubgraph: SubgraphOptionType;
  private readonly rawClaimFromSubgraph?: SubgraphClaimERC1155;

  private constructor({
    subgraphPosition,
    subgraphOptionType,
    optionType,
  }: {
    subgraphPosition: SubgraphOptionPosition;
    subgraphOptionType: SubgraphOptionType;
    optionType: OptionType;
  }) {
    super({
      optionInfo: optionType.optionInfo,
      optionTypeId: optionType.optionTypeId,
      typeExists: optionType.typeExists,
    });

    // save raw data for deriving other properties
    this.rawPositionFromSubgraph = subgraphPosition;
    this.rawOptionTypeFromSubgraph = subgraphOptionType;
    if (subgraphPosition.token.claim) {
      this.rawClaimFromSubgraph = subgraphPosition.token.claim;
    }
  }

  get id() {
    if (this.isClaim) {
      if (!this.claim)
        throw new Error(
          'Malformed data received from subgraph. Missing claim.',
        );
      return this.claim.id;
    }
    return this.rawOptionTypeFromSubgraph.id;
  }

  get pair() {
    return {
      underlyingAsset: this.underlyingAsset,
      exerciseAsset: this.exerciseAsset,
    };
  }

  get exerciseTimestamp() {
    return this.optionInfo.exerciseTimestamp;
  }

  get expiryTimestamp() {
    return this.optionInfo.expiryTimestamp;
  }

  get optionId() {
    return BigInt(this.id);
  }

  get isOwned() {
    return !this.rawPositionFromSubgraph.id.includes('totalSupply');
  }

  get claim() {
    return this.rawClaimFromSubgraph;
  }

  get isClaim() {
    return this.rawPositionFromSubgraph.token.type === 2;
  }

  get isCall() {
    return (
      this.rawPositionFromSubgraph.token.optionType?.exerciseAsset.symbol ===
      'USDC'
    );
  }

  get amountWritten() {
    if (!this.rawClaimFromSubgraph?.amountWritten)
      throw new Error('Not a claim, or claim missing amountWritten');
    return BigInt(this.rawClaimFromSubgraph.amountWritten);
  }

  get amountExercised() {
    if (!this.rawClaimFromSubgraph?.amountExercised)
      throw new Error('Not a claim, or claim missing amountExercised');
    return BigInt(this.rawClaimFromSubgraph.amountExercised);
  }

  get quantityOwned() {
    if (!this.isOwned) {
      return 0n;
    }

    return BigInt(this.rawPositionFromSubgraph.valueExact);
  }

  // We use this in the position table + details for shorts,
  // rather than the balanceOf()/quantityOwned (which would always be 0.0000001 for claims)
  // aka size of the position
  get magnitude() {
    // The short position magnitude represents the amountWritten for the claim
    if (this.isClaim) {
      return Number(this.amountWritten.toString()) / 1e6;
    }
    // The long position magnitude is simply the amount owned by the user
    return Number(this.quantityOwned.toString()) / 1e6;
  }

  private get stableAmount() {
    return this.exerciseIsStable
      ? this.optionInfo.exerciseAmount
      : this.optionInfo.underlyingAmount;
  }

  private get volatileAmount() {
    return this.exerciseIsStable
      ? this.optionInfo.underlyingAmount
      : this.optionInfo.exerciseAmount;
  }

  get tokensPerContract() {
    if (this.volatileAmount === BigInt(0)) return undefined;
    return (
      (this.volatileAmount * BASE_SCALAR_BN) /
      parseUnits('1', this.volatileAsset.decimals)
    );
  }

  get strike() {
    if (!this.tokensPerContract || this.stableAmount === BigInt(0)) return 0;

    return Number((this.stableAmount / this.tokensPerContract).toString());
  }

  get strategyTitle() {
    return `${this.isClaim ? 'Short' : 'Long'} ${this.isCall ? 'Call' : 'Put'}`;
  }

  get isOptionBeforeExerciseWindow() {
    if (this.isClaim) return false;
    return isBefore(
      Date.now(),
      fromUnixTime(Number(this.optionInfo.exerciseTimestamp)),
    );
  }

  get isOptionExpired() {
    if (this.isClaim) return false;
    return isAfter(
      Date.now(),
      fromUnixTime(Number(this.optionInfo.expiryTimestamp)),
    );
  }

  get isOptionExercisable() {
    if (this.isClaim) return false;
    return !this.isOptionBeforeExerciseWindow && !this.isOptionExpired;
  }

  get isClaimRedeemable() {
    return (
      !this.claim?.redeemed &&
      isAfter(Date.now(), fromUnixTime(Number(this.optionInfo.expiryTimestamp)))
    );
  }

  get ticker() {
    /* ASSET-EXPIRY-STRIKE-TYPE */
    /* examples: ETH-8SEP23-1650-C for Long Call, or GMX-8SEP23-1650-P for Long Put */
    const volatileSymbol = this.volatileAsset.symbol;
    const actionType = this.isCall ? 'C' : 'P';

    return `${volatileSymbol}-${format(
      fromUnixTime(this.optionInfo.expiryTimestamp),
      'dMMMyy',
    ).toUpperCase()}-${this.strike.toString()}-${actionType}`;
  }

  static fromSubgraphPosition({
    subgraphPosition,
    chainId,
  }: {
    subgraphPosition: SubgraphOptionPosition;
    chainId: number;
  }) {
    if (chainId !== 42161 && chainId !== 421613)
      throw new Error('Unsupported chainId');

    // determine if ERC-1155 is exercisable option or redeemable claim
    const isClaim = subgraphPosition.token.type === 2;

    // extract the optionType/option payload
    const subgraphOptionType = isClaim
      ? subgraphPosition.token.claim?.optionType
      : subgraphPosition.token.optionType;

    // verify optionType from subgraph has the necessary data to reconstruct
    if (!subgraphOptionType?.exerciseAsset)
      throw new Error('No exercise asset');
    if (!subgraphOptionType.exerciseAmount)
      throw new Error('No exercise amount');
    if (!subgraphOptionType.underlyingAmount)
      throw new Error('No underlying amount');
    if (
      !subgraphOptionType.exerciseTimestamp ||
      Number.isNaN(Number(subgraphOptionType.exerciseTimestamp))
    ) {
      throw new Error('Missing or invalid exercise timestamp');
    }
    if (
      !subgraphOptionType.expiryTimestamp ||
      Number.isNaN(Number(subgraphOptionType.expiryTimestamp))
    ) {
      throw new Error('Missing or invalid expiry timestamp');
    }

    const optionType = OptionType.fromSubgraph({
      subgraphOptionType,
      chainId,
    });

    return new this({
      subgraphPosition,
      subgraphOptionType,
      optionType,
    });
  }
}

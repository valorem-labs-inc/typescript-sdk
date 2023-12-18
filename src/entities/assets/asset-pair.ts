import type { SupportedAsset } from './supported-asset';

export class OptionAssetPair {
  public readonly exerciseAsset: SupportedAsset;
  public readonly underlyingAsset: SupportedAsset;

  constructor({
    exerciseAsset,
    underlyingAsset,
  }: {
    exerciseAsset: SupportedAsset;
    underlyingAsset: SupportedAsset;
  }) {
    this.exerciseAsset = exerciseAsset;
    this.underlyingAsset = underlyingAsset;
  }

  get exerciseIsStable() {
    return this.exerciseAsset.isStableCoin;
  }

  get stableAsset() {
    return this.exerciseIsStable ? this.exerciseAsset : this.underlyingAsset;
  }

  get volatileAsset() {
    return this.exerciseIsStable ? this.underlyingAsset : this.exerciseAsset;
  }
}

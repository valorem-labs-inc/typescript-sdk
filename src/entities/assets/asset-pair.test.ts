import { describe, expect, it } from 'vitest';
import { OptionAssetPair } from './asset-pair';
import { SupportedAsset } from '.';

describe('Asset Pair Entity', () => {
  it('Should load the proper values', () => {
    const pair1 = new OptionAssetPair({
      exerciseAsset: SupportedAsset.fromSymbolAndChainId('USDC', 421614),
      underlyingAsset: SupportedAsset.fromSymbolAndChainId('WETH', 421614),
    });

    expect(pair1.underlyingAsset.symbol).toEqual('WETH');
    expect(pair1.exerciseAsset.symbol).toEqual('USDC');

    expect(pair1.exerciseIsStable).toBeTruthy();

    expect(pair1.stableAsset.symbol).toEqual('USDC');
    expect(pair1.volatileAsset.symbol).toEqual('WETH');

    const pair2 = new OptionAssetPair({
      exerciseAsset: SupportedAsset.fromSymbolAndChainId('WETH', 421614),
      underlyingAsset: SupportedAsset.fromSymbolAndChainId('USDC', 421614),
    });

    expect(pair2.underlyingAsset.symbol).toEqual('USDC');
    expect(pair2.exerciseAsset.symbol).toEqual('WETH');

    expect(pair2.exerciseIsStable).toBeFalsy();

    expect(pair2.stableAsset.symbol).toEqual('USDC');
    expect(pair2.volatileAsset.symbol).toEqual('WETH');
  });
});

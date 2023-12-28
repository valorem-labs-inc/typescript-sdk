import { describe, expect, it } from 'vitest';
import type { SupportedAssetSymbol, SupportedChainId } from '../../types';
import { SUPPORTED_CHAINS } from '../../constants';
import { SupportedAsset, SUPPORTED_ASSETS } from './supported-asset';

const arbitrumWETH = SUPPORTED_ASSETS.filter(
  (asset) => asset.symbol === 'WETH' && asset.chainId === 42161,
)[0];
const arbitrumGoerliUSDC = SUPPORTED_ASSETS.filter(
  (asset) => asset.symbol === 'USDC' && asset.chainId === 421613,
)[0];

describe('Asset Entity', () => {
  it('Should load supported assets with proper values', () => {
    const asset = SupportedAsset.fromSymbolAndChainId('WETH', 42161);

    expect(asset.isSupported).toBeTruthy();
    expect(asset.isStableCoin).toBeFalsy();

    expect(asset.name).toEqual(arbitrumWETH.name);
    expect(asset.symbol).toEqual(arbitrumWETH.symbol);
    expect(asset.address).toEqual(arbitrumWETH.address);
    expect(asset.decimals).toEqual(arbitrumWETH.decimals);
    expect(asset.chainId).toEqual(arbitrumWETH.chainId);

    expect(asset.parse('100')).toEqual(BigInt('100000000000000000000'));
    expect(asset.format(BigInt('100000000000000000000'))).toEqual('100');
  });

  it('Should return the proper values for USDC', () => {
    const asset = SupportedAsset.fromSymbolAndChainId('USDC', 421613);

    expect(asset.isSupported).toBeTruthy();
    expect(asset.isStableCoin).toBeTruthy();

    expect(asset.name).toEqual(arbitrumGoerliUSDC.name);
    expect(asset.symbol).toEqual(arbitrumGoerliUSDC.symbol);
    expect(asset.address).toEqual(arbitrumGoerliUSDC.address);
    expect(asset.decimals).toEqual(arbitrumGoerliUSDC.decimals);
    expect(asset.chainId).toEqual(arbitrumGoerliUSDC.chainId);

    expect(asset.parse('1')).toEqual(BigInt('1000000'));
    expect(asset.format(BigInt('1000000'))).toEqual('1');
  });

  it('Should load supported assets for a chainId', () => {
    Object.values(SUPPORTED_CHAINS).forEach(({ id }) => {
      const assets = SupportedAsset.getSupportedAssetsByChainId(id);

      expect(assets.length).toEqual(2);
      expect(assets[0].symbol).toEqual('USDC');
      expect(assets[1].symbol).toEqual('WETH');
    });
  });

  it('Should throw an error if no supported asset is found', () => {
    expect(() =>
      SupportedAsset.fromSymbolAndChainId(
        'MOCK' as SupportedAssetSymbol,
        1337 as SupportedChainId,
      ),
    ).toThrow();

    expect(() => SupportedAsset.fromAddress('0x1234567890')).toThrow();
  });
});

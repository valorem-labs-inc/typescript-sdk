import { describe, expect, it } from 'vitest';
import { Asset } from './asset';

const name = 'Test Token';
const symbol = 'TEST';
const address = '0x1234567890';
const decimals = 18;
const chainId = 1337;

describe('Asset Entity', () => {
  it('Should return the proper values', () => {
    const asset = new Asset({
      name,
      symbol,
      address,
      decimals,
      chainId,
    });

    expect(asset.name).toEqual(name);
    expect(asset.symbol).toEqual(symbol);
    expect(asset.address).toEqual(address);
    expect(asset.decimals).toEqual(decimals);
    expect(asset.chainId).toEqual(chainId);

    expect(asset.isSupported).toBeFalsy();
    expect(asset.isStableCoin).toBeFalsy();
    expect(asset.parse('100')).toEqual(BigInt('100000000000000000000'));
    expect(asset.format(BigInt('100000000000000000000'))).toEqual('100');
  });

  it('Should return the proper values for USDC', () => {
    const stableAsset = new Asset({
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address,
      chainId,
    });

    expect(stableAsset.isStableCoin).toBeTruthy();
  });
});

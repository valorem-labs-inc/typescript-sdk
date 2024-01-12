import type { Address } from 'viem';
import type { SupportedChainId } from '../../utils/chains';
import type { ERC20Token } from './asset';
import { Asset } from './asset';

export type SupportedAssetSymbol = 'USDC' | 'WETH' | 'WBTC' | 'ARB';

interface SupportedERC20Token extends ERC20Token {
  chainId: SupportedChainId;
  symbol: SupportedAssetSymbol;
}

export class SupportedAsset extends Asset {
  readonly isSupported = true;
  readonly symbol: SupportedAssetSymbol;
  readonly chainId: SupportedChainId;

  constructor(args: SupportedERC20Token) {
    super(args);
    this.symbol = args.symbol;
    this.chainId = args.chainId;
  }

  static getSupportedAssetsByChainId(
    chainId: SupportedChainId,
  ): SupportedAsset[] {
    return SUPPORTED_ASSETS.filter((asset) => asset.chainId === chainId);
  }

  static fromSymbolAndChainId(
    symbol: SupportedAssetSymbol,
    chainId: SupportedChainId,
  ): SupportedAsset {
    const asset = SUPPORTED_ASSETS.find(
      (_asset) => _asset.symbol === symbol && _asset.chainId === chainId,
    );
    if (!asset) {
      throw new Error(`No supported asset for symbol ${symbol}`);
    }
    return asset;
  }

  static fromAddress(address: Address): SupportedAsset {
    const assets = SUPPORTED_ASSETS.filter(
      (_asset) => _asset.address.toLowerCase() === address.toLowerCase(),
    );
    if (assets.length === 0) {
      throw new Error(`No asset found for address ${address}`);
    }
    return assets[0];
  }
}

export const SUPPORTED_ASSETS: SupportedAsset[] = [
  /* Arbitrum One */
  {
    chainId: 42161,
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    // Native USDC address on Arbitrum One (not Bridged USDC.e)
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  } as const,
  {
    chainId: 42161,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  } as const,
  {
    chainId: 42161,
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
  } as const,
  {
    chainId: 42161,
    name: 'Arbitrum',
    symbol: 'ARB',
    decimals: 18,
    address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
  } as const,
  /* Arbitrum Sepolia */
  {
    chainId: 421614,
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: '0xa957Cfc02c20D513aAfA5FaA91A5Ff0068eE2De7',
  } as const,
  {
    chainId: 421614,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0x9Eb7fE3FA85f44e74e0407d060429e5a11431f3E',
  } as const,
  {
    chainId: 421614,
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    address: '0xB5D16f8DEda771E1f6aa0Bc4c26007B16bcB8009',
  } as const,
  {
    chainId: 421614,
    name: 'Arbitrum',
    symbol: 'ARB',
    decimals: 18,
    address: '0xd20A4136D7f88dBa2ACB2C72379697CE7DD82cD0',
  } as const,
  /* Foundry */
  {
    chainId: 31337,
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: '0xa957Cfc02c20D513aAfA5FaA91A5Ff0068eE2De7',
  } as const,
  {
    chainId: 31337,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0x9Eb7fE3FA85f44e74e0407d060429e5a11431f3E',
  } as const,
  {
    chainId: 31337,
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    address: '0xB5D16f8DEda771E1f6aa0Bc4c26007B16bcB8009',
  } as const,
  {
    chainId: 31337,
    name: 'Arbitrum',
    symbol: 'ARB',
    decimals: 18,
    address: '0xd20A4136D7f88dBa2ACB2C72379697CE7DD82cD0',
  } as const,
].map((token) => new SupportedAsset(token));

import type { Address } from 'viem';
import { formatUnits, parseUnits } from 'viem';

export interface ERC20Token {
  name: string;
  symbol: string;
  decimals: number;
  address: Address;
  chainId: number;
}

export class Asset {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly address: Address;
  readonly chainId: number;

  readonly isSupported: boolean = false;

  constructor({ name, symbol, address, decimals, chainId }: ERC20Token) {
    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;
    this.chainId = chainId;
    this.address = address;
  }

  get isStableCoin() {
    return this.symbol.toLowerCase() === 'usdc';
  }

  parse(value: string) {
    return parseUnits(value, this.decimals);
  }

  format(value: bigint) {
    return formatUnits(value, this.decimals);
  }
}

import type {
  erc20ABI as ERC20_ABI,
  PublicClient,
  WalletClient,
} from '@wagmi/core';
import type { Abi, Account, Address, Chain, Transport } from 'viem';
import { getContract } from 'viem';
import type {
  CLEAR_ABI,
  SEAPORT_V1_5_ABI,
  SEAPORT_VALIDATOR_ABI,
} from '../../abi';
import type { LoggerConfig } from '../../logger';
import { Logger } from '../../logger';

type IContract<T extends Abi> = ReturnType<
  typeof getContract<
    Transport,
    Address,
    T,
    Chain,
    Account,
    PublicClient,
    WalletClient
  >
>;

export interface ContractConstructorArgs extends LoggerConfig {
  address: Address;
  abi: Abi;
  publicClient: PublicClient;
  walletClient?: WalletClient;
}

export type IClearinghouse = IContract<typeof CLEAR_ABI>;
export type ISeaport = IContract<typeof SEAPORT_V1_5_ABI>;
export type ISeaportValidator = IContract<typeof SEAPORT_VALIDATOR_ABI>;
export type IERC20 = IContract<typeof ERC20_ABI>;

/** Reusable extension of viem's contract interface */
export class Contract<TContract extends IClearinghouse | ISeaport | IERC20> {
  public address: Address;
  public read: TContract['read'];
  public simulate: TContract['simulate'];
  public write?: TContract['write'];

  private contract: TContract;

  protected logger: Logger;

  public constructor({
    address,
    abi,
    publicClient,
    walletClient,
    logLevel,
  }: ContractConstructorArgs) {
    this.contract = getContract({
      address,
      abi,
      walletClient,
      publicClient,
    }) as unknown as TContract;

    this.address = address;
    this.read = this.contract.read as TContract['read'];
    this.simulate = this.contract.simulate as TContract['simulate'];
    this.write = this.contract.write as TContract['write'];

    this.logger = new Logger({ logLevel });
  }
}

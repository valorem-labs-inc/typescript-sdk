import type {
  erc20ABI as ERC20_ABI,
  PublicClient,
  WalletClient,
} from '@wagmi/core';
import type { Abi, Account, Address, Chain, Transport } from 'viem';
import { getContract } from 'viem';
import type { SEAPORT_VALIDATOR_ABI } from '../../abi/seaport-order-validator';
import type { SEAPORT_V1_5_ABI } from '../../abi/seaport';
import type { CLEAR_ABI } from '../../abi/clearinghouse';

/**
 * Type helper for creating a contract instance.
 */
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

/**
 * Constructor arguments for creating a new Contract instance.
 */
export interface ContractConstructorArgs {
  address: Address;
  abi: Abi;
  publicClient: PublicClient;
  walletClient?: WalletClient;
}

/**
 * Interface for the Clearinghouse contract.
 */
export type IClearinghouse = IContract<typeof CLEAR_ABI>;

/**
 * Interface for the Seaport contract.
 */
export type ISeaport = IContract<typeof SEAPORT_V1_5_ABI>;

/**
 * Interface for the Seaport Validator contract.
 */
export type ISeaportValidator = IContract<typeof SEAPORT_VALIDATOR_ABI>;

/**
 * Interface for the ERC20 contract.
 */
export type IERC20 = IContract<typeof ERC20_ABI>;

/**
 * Reusable extension of viem's contract interface to interact with smart contracts.
 * Provides read and write functionality through the public and wallet clients.
 *
 * TContract - The contract type which can be either IClearinghouse, ISeaport, or IERC20.
 */
export class Contract<TContract extends IClearinghouse | ISeaport | IERC20> {
  /**
   * Address of the smart contract.
   */
  public address: Address;

  /**
   * Read-only methods of the smart contract.
   */
  public read: TContract['read'];

  /**
   * Simulated methods of the smart contract.
   */
  public simulate: TContract['simulate'];

  /**
   * State-changing methods of the smart contract. Present only if walletClient is provided.
   */
  public write?: TContract['write'];

  private contract: TContract;

  /**
   * Constructs a new Contract instance.
   *
   * @param args - The constructor arguments containing the contract address, ABI, and clients for interaction.
   */
  public constructor({
    address,
    abi,
    publicClient,
    walletClient,
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
  }
}

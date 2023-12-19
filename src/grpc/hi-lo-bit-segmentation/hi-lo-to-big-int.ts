import type { Address } from 'viem';
import { getAddress, pad, toHex } from 'viem';
import type {
  H40,
  H96,
  H128,
  H160,
  H256,
} from '../../lib/codegen/grpc/types_pb';

/**
 * Converts a H40 (40-bit high-low structure) to a bigint.
 * @param value - The H40 value to convert.
 * @returns The converted bigint value.
 */
export const fromH40 = (value: H40): bigint => {
  const lo = BigInt(value.lo);
  const hi = BigInt(value.hi) << 8n;

  return lo | hi;
};

/**
 * Converts a H96 (96-bit high-low structure) to a bigint.
 * @param value - The H96 value to convert.
 * @returns The converted bigint value.
 */

export const fromH96 = (value: H96): bigint => {
  const lo = BigInt(value.lo);
  const hi = BigInt(value.hi) << 32n;

  return lo | hi;
};

/**
 * Converts a H128 (128-bit high-low structure) to a bigint.
 * @param value - The H128 value to convert.
 * @returns The converted bigint value.
 */
export const fromH128 = (value: H128): bigint => {
  const lo = BigInt(value.lo);
  const hi = BigInt(value.hi) << 64n;

  return lo | hi;
};

/**
 * Converts a H160 (160-bit high-low structure) to a bigint.
 * This is commonly used for Ethereum address conversions.
 * @param value - The H160 value to convert.
 * @returns The converted bigint value.
 * @throws Error if the high part (hi) of the H160 value is undefined.
 */
export const fromH160 = (value: H160): bigint => {
  if (!value.hi) throw new Error('hi is undefined');

  const lo = BigInt(value.lo);
  const hi = fromH128(value.hi) << 32n;

  return lo | hi;
};

/**
 * Converts a H160 value to an Ethereum address.
 * @param value - The H160 value to convert.
 * @returns The Ethereum address as a string.
 */
export const fromH160ToAddress = (value: H160): Address => {
  const unpadded = fromH160(value);

  return getAddress(pad(toHex(unpadded), { size: 20 }));
};

/**
 * Converts a H256 (256-bit high-low structure) to a bigint.
 * This is useful for handling larger numeric values in blockchain contexts.
 * @param value - The H256 value to convert.
 * @returns The converted bigint value.
 * @throws Error if the low (lo) or high (hi) part of the H256 value is undefined.
 */
export const fromH256 = (value: H256): bigint => {
  if (!value.lo) throw new Error('lo is undefined');
  if (!value.hi) throw new Error('hi is undefined');

  const loLo = BigInt(value.lo.lo);
  const loHi = BigInt(value.lo.hi) << 64n;

  const hiLo = BigInt(value.hi.lo) << 128n;
  const hiHi = BigInt(value.hi.hi) << 192n;

  return loLo | loHi | hiLo | hiHi;
};

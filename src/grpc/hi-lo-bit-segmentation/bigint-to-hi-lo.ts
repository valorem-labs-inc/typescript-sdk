import { H40, H96, H128, H160, H256 } from '../../lib';

type BigIntable = string | number | bigint | boolean;

/**
 * Converts a value to a H40 (40-bit high-low structure) format.
 * @param value - A value that can be converted to a bigint.
 * @returns The H40 representation of the value.
 */
export const toH40 = (value: BigIntable): H40 => {
  const bn = BigInt(value);

  const hi = Number(bn >> 32n);
  const lo = Number(bn & 0xffn);

  return new H40({
    hi,
    lo,
  });
};

/**
 * Converts a value to a H96 (96-bit high-low structure) format.
 * @param value - A value that can be converted to a bigint.
 * @returns The H96 representation of the value.
 */
export const toH96 = (value: BigIntable): H96 => {
  const bn = BigInt(value);

  const hi = bn >> 32n;
  const lo = Number(bn & 0xffffffffn);

  return new H96({
    hi,
    lo,
  });
};

/**
 * Converts a value to a H128 (128-bit high-low structure) format.
 * @param value - A value that can be converted to a bigint.
 * @returns The H128 representation of the value.
 */
export const toH128 = (value: BigIntable): H128 => {
  const bn = BigInt(value);

  const hi = bn >> 64n;
  const lo = bn & 0xffffffffffffffffn;

  return new H128({
    hi,
    lo,
  });
};

/**
 * Converts a value to a H160 (160-bit high-low structure) format.
 * This is commonly used for Ethereum address conversions.
 * @param value - A value that can be converted to a bigint.
 * @returns The H160 representation of the value.
 */
export const toH160 = (value: BigIntable): H160 => {
  const bn = BigInt(value);

  const hi = toH128(bn >> 32n);
  const lo = Number(bn & 0xffffffffn);

  return new H160({
    hi,
    lo,
  });
};

/**
 * Converts a value to a H256 (256-bit high-low structure) format.
 * This is useful for handling larger numeric values in blockchain contexts.
 * @param value - A value that can be converted to a bigint.
 * @returns The H256 representation of the value.
 */
export const toH256 = (value: BigIntable): H256 => {
  const bn = BigInt(value);

  const hi = toH128(bn >> 128n);
  const lo = toH128(bn & 0xffffffffffffffffffffffffffffffffn);

  return new H256({
    hi,
    lo,
  });
};

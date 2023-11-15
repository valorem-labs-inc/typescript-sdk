import { ONE_DAY_UNIX } from '../constants';

/**
 * Convert the UTC date to a unix timestamp,
 * Casts to integer (via Math.floor) for conversion to BigInts
 */
export const toUnix = (date: Date) => Math.floor(date.getTime() / 1000);

/**
 * By aligning to 8AM UTC, we limit fragmentation of liquidity
 *
 * @param date - The date to adjust.
 * @returns The adjusted 8 AM UTC date.
 */
export function get8AMUTCDate(date?: Date) {
  const today = date ?? new Date();
  const currentHour = today.getUTCHours();
  const currentMinutes = today.getUTCMinutes();
  const shiftDays =
    currentHour > 7 || (currentHour === 7 && currentMinutes > 30) ? 1 : 0;
  const nextDate = new Date(today);
  nextDate.setUTCDate(today.getUTCDate() + shiftDays);
  nextDate.setUTCHours(8, 0, 0, 0); // Set the time to 8am UTC
  return toUnix(nextDate);
}

export function get24HrTimestamps(date?: Date): {
  exerciseTimestamp: number;
  expiryTimestamp: number;
} {
  const exerciseTimestamp = get8AMUTCDate(date);
  const expiryTimestamp = exerciseTimestamp + ONE_DAY_UNIX; // expires in 1 day

  return { exerciseTimestamp, expiryTimestamp };
}

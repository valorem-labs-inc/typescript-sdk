import { ONE_DAY_UNIX } from '../constants';

/**
 * Converts a Date object to a Unix timestamp.
 * The timestamp is rounded down to the nearest whole second for compatibility with BigInt.
 * @param date - The Date object to convert.
 * @returns The Unix timestamp as an integer.
 */
export const toUnix = (date: Date) => Math.floor(date.getTime() / 1000);

/**
 * Aligns a given date to 8 AM UTC of the current or next day.
 * This function is used to standardize times, reducing liquidity fragmentation.
 * @param date - The date to adjust. If not provided, the current date is used.
 * @returns The Unix timestamp for 8 AM UTC of the adjusted date.
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

/**
 * Generates timestamps for a 24-hour period starting from 8 AM UTC of a given or current day.
 * @param date - The starting date. If not provided, the current date is used.
 * @returns An object with 'exerciseTimestamp' and 'expiryTimestamp' representing the start and end of the 24-hour period.
 */
export function get24HrTimestamps(date?: Date): {
  exerciseTimestamp: number;
  expiryTimestamp: number;
} {
  const exerciseTimestamp = get8AMUTCDate(date);
  const expiryTimestamp = exerciseTimestamp + ONE_DAY_UNIX; // expires in 1 day

  return { exerciseTimestamp, expiryTimestamp };
}

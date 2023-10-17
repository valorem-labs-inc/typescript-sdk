import { ONE_DAY_UNIX } from '../constants';

/**
 * By aligning to 8AM UTC, we limit fragmentation of liquidity
 *
 * @param date - The date to adjust.
 * @returns The adjusted 8 AM UTC date.
 */
export function get8AMUTCDate(date: Date) {
  const today = new Date();
  // Convert tomorrow's date to its UTC equivalent. This is achieved by adjusting
  // the local date with the timezone offset in milliseconds.
  const tzOffsetMS = today.getTimezoneOffset() * 60000;
  const utcDateMilliseconds = today.getTime() + tzOffsetMS;

  // Create a new Date object from the UTC milliseconds.
  const utcDate = new Date(utcDateMilliseconds);

  // Set the UTC time to 8:00:00 AM.
  utcDate.setUTCHours(8, 0, 0, 0);

  // If the original date is before the newly constructed 8AM UTC date, return
  // the 8AM date. Otherwise, return 8AM of the following day. This ensures that
  // we're always returning a future date relative to the original input.
  if (date.getTime() >= utcDate.getTime()) {
    return (utcDate.getTime() + ONE_DAY_UNIX) / 1000; // Convert the UTC date to a unix timestamp
  }
  return utcDate.getTime() / 1000; // Convert the UTC date to a unix timestamp
}

export function get24HrTimestamps(): {
  exerciseTimestamp: number;
  expiryTimestamp: number;
} {
  const exerciseTimestamp = get8AMUTCDate(new Date());
  const expiryTimestamp = exerciseTimestamp + ONE_DAY_UNIX; // expires in 1 day

  return { exerciseTimestamp, expiryTimestamp };
}

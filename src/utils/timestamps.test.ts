import { describe, expect, it } from 'vitest';
import { get24HrTimestamps, get8AMUTCDate, toUnix } from './timestamps';

describe('Timestamps', () => {
  describe('toUnix', () => {
    it('Should convert a date to a unix timestamp that is an integer', () => {
      const problematicMillisecondTimestamp = 1700081643333;
      const expectedUnixConversion = 1700081643;
      const badUnixConversion = problematicMillisecondTimestamp / 1000;
      expect(badUnixConversion).not.toEqual(expectedUnixConversion);
      expect(toUnix(new Date(problematicMillisecondTimestamp))).toEqual(
        expectedUnixConversion,
      );
    });
  });

  describe('get8AMUTCDate', () => {
    it('Should return a date that is 8AM UTC', () => {
      const testTimestamp = Date.UTC(2023, 12, 31, 0, 0, 0, 333); // 2023-12-31T00:00:00.333Z
      const expectedTimestamp = Date.UTC(2023, 12, 31, 8, 0, 0, 0); // 2023-12-31T08:00:00.000Z
      expect(get8AMUTCDate(new Date(testTimestamp))).toEqual(
        toUnix(new Date(expectedTimestamp)),
      );
    });

    it('Should return the next day if UTC date is before the passed date', () => {
      const testTimestamp = Date.UTC(2023, 12, 31, 9, 0, 0, 333); // 2023-12-31T09:00:00.333Z
      const expectedTimestamp = Date.UTC(2024, 1, 1, 8, 0, 0, 0); // 2024-1-1T08:00:00.000Z
      expect(get8AMUTCDate(new Date(testTimestamp))).toEqual(
        toUnix(new Date(expectedTimestamp)),
      );
    });
  });

  describe('get24HrTimestamps', () => {
    it('Should return two timestamps that are 24 hours apart', () => {
      const testTimestamp = Date.UTC(2023, 12, 31, 9, 0, 0, 333); // 2023-12-31T09:00:00.333Z
      const { exerciseTimestamp, expiryTimestamp } = get24HrTimestamps(
        new Date(testTimestamp),
      );
      expect(expiryTimestamp - exerciseTimestamp).toEqual(86400);
      expect(exerciseTimestamp * 1000).toEqual(Date.UTC(2024, 1, 1, 8));
      expect(expiryTimestamp * 1000).toEqual(Date.UTC(2024, 1, 2, 8));
    });
  });
});

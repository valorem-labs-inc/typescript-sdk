import { Option } from '../src/entities/option';
import { describe, expect, it } from 'vitest';

describe('Option Class', () => {
  it('Should be able to create an option, and return the correct optionId', () => {
    const option = new Option({
      underlyingAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      underlyingAmount: 1000000000000n,
      exerciseAsset: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      exerciseAmount: 1650n,
      exerciseTimestamp: 1697011200,
      expiryTimestamp: 1697097600,
    });

    // https://arbiscan.io/tx/0xd0d6f2bcf69d7384339f9e191e29facccb397c97e702e782c3375a418a1b420f#eventlog
    expect(option.id).toEqual(
      84782596180596890449185383274394720898372988505602355501149732427038550130688n,
    );
  });
});

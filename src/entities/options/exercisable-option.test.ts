import { describe, expect, it } from 'vitest';
import { clearinghouse } from '../../../test';
import { Option } from './exercisable-option';
import { Claim } from './redeemable-claim';
import { OptionType } from './option-type';

// The unique identifier for the option we want to test.
const optionId =
  72843026366421500206466009172807756685221693984775973000410191373222805504000n;

describe('Exercisable Option', () => {
  it('Should be able to load an Option', async () => {
    // Load the option from its ID using the clearinghouse contract.
    const option = await Option.fromId(optionId, clearinghouse);

    // Assert various properties of the option to ensure it has loaded correctly.
    expect(option.tokenId).toEqual(optionId);
    expect(option.tokenType).toEqual(1);
    expect(option.typeExists).toBeTruthy();
    expect(option.optionTypeId).toEqual(optionId);
    expect(option.optionInfo).toBeDefined();

    // Check the instance types to confirm the option's inheritance and type.
    expect(option instanceof Option).toBeTruthy();
    expect(option instanceof OptionType).toBeTruthy();
    expect(option instanceof Claim).toBeFalsy();
  });
});

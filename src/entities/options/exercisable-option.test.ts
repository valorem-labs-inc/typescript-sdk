import { describe, expect, it } from 'vitest';
import { clearinghouse } from '../../../test';
import { Option } from './exercisable-option';
import { Claim } from './redeemable-claim';
import { OptionType } from './option-type';

const optionId =
  39619444411110155182191577564943662405077439414287374917766485031893178777600n;

describe('Exercisable Option', () => {
  it('Should be able to load a Option', async () => {
    const option = await Option.fromId(optionId, clearinghouse);

    expect(option.tokenId).toEqual(optionId);
    expect(option.tokenType).toEqual(1);
    expect(option.typeExists).toBeTruthy();
    expect(option.optionTypeId).toEqual(optionId);
    expect(option.optionInfo).toBeDefined();
    expect(option instanceof Option).toBeTruthy();
    expect(option instanceof OptionType).toBeTruthy();
    expect(option instanceof Claim).toBeFalsy();
  });
});

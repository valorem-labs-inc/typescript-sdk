import { describe, expect, it } from 'vitest';
import { clearinghouse } from '../../../test';
import { Claim } from './redeemable-claim';
import { OptionType } from './option-type';
import { Option } from './exercisable-option';

const claimId =
  39619444411110155182191577564943662405077439414287374917766485031893178777601n;
const expectedOptionTypeId =
  39619444411110155182191577564943662405077439414287374917766485031893178777600n;

describe('Redeemable Claim', () => {
  it('Should be able to load a Claim', async () => {
    const claim = await Claim.fromId(claimId, clearinghouse);

    expect(claim.tokenId).toEqual(claimId);
    expect(claim.tokenType).toEqual(2);
    expect(claim.typeExists).toBeTruthy();
    expect(claim.optionTypeId).toEqual(expectedOptionTypeId);
    expect(claim.optionInfo).toBeDefined();
    expect(claim instanceof Claim).toBeTruthy();
    expect(claim instanceof OptionType).toBeTruthy();
    expect(claim instanceof Option).toBeFalsy();
  });
});

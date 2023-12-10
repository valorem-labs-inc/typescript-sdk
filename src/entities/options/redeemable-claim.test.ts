import { describe, expect, it } from 'vitest';
import { clearinghouse } from '../../../test';
import { Claim } from './redeemable-claim';
import { OptionType } from './option-type';
import { Option } from './exercisable-option';

// The unique identifier for the claim we want to test.
const claimId =
  39619444411110155182191577564943662405077439414287374917766485031893178777601n;

// Expected option type identifier for the claim.
const expectedOptionTypeId =
  39619444411110155182191577564943662405077439414287374917766485031893178777600n;

describe('Redeemable Claim', () => {
  it('Should be able to load a Claim', async () => {
    // Load the claim from its ID using the clearinghouse contract.
    const claim = await Claim.fromId(claimId, clearinghouse);

    // Assert various properties of the claim to ensure it has loaded correctly.
    expect(claim.tokenId).toEqual(claimId);
    expect(claim.tokenType).toEqual(0); // 0 indicates a redeemable claim
    expect(claim.redeemed).toBeTruthy(); // Assumes the claim has already been redeemed
    expect(claim.typeExists).toBeTruthy();
    expect(claim.optionTypeId).toEqual(expectedOptionTypeId);
    expect(claim.optionInfo).toBeDefined();

    // Check the instance types to confirm the claim's inheritance and type.
    // TODO(These can be simplified)
    expect(claim instanceof Claim).toBeTruthy();
    expect(claim instanceof OptionType).toBeTruthy();
    expect(claim instanceof Option).toBeFalsy();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { publicClient } from '../../../test';
import { Claim } from './redeemable-claim';

const claimId =
  39619444411110155182191577564943662405077439414287374917766485031893178777601n;
const expectedOptionTypeId =
  39619444411110155182191577564943662405077439414287374917766485031893178777600n;

describe('Redeemable Claim', () => {
  it('Should be able to load a Claim', async () => {
    const claim = new Claim({ claimId, publicClient });

    await vi.waitUntil(() => claim.ready);

    expect(claim.ready).toBeTruthy();
    expect(claim.tokenId).toEqual(claimId);
    expect(claim.tokenType).toEqual(2);
    expect(claim.typeExists).toBeTruthy();
    expect(claim.optionTypeId).toEqual(expectedOptionTypeId);
    expect(claim.optionInfo).toBeDefined();
  });
});

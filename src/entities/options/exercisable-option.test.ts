import { describe, expect, it, vi } from 'vitest';
import { publicClient } from '../../../test';
import { Option } from './exercisable-option';

const optionId =
  39619444411110155182191577564943662405077439414287374917766485031893178777600n;

describe('Exercisable Option', () => {
  it('Should be able to load a Option', async () => {
    const option = new Option({ optionId, publicClient });

    await vi.waitUntil(() => option.ready);

    expect(option.ready).toBeTruthy();
    expect(option.tokenId).toEqual(optionId);
    expect(option.tokenType).toEqual(1);
    expect(option.typeExists).toBeTruthy();
    expect(option.optionTypeId).toEqual(optionId);
    expect(option.optionInfo).toBeDefined();
  });
});

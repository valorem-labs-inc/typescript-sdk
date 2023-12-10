import { describe, expect, it } from 'vitest';
import { clearinghouse } from '../../../test';
import { OptionType } from './option-type';

// Expected option type identifier for the test
const expectedOptionTypeId =
  39619444411110155182191577564943662405077439414287374917766485031893178777600n;

describe('Option Class', () => {
  it('Should be able to create an option, and return the correct optionId', async () => {
    // Attempt to create an option type based on provided option information
    // https://arbiscan.io/tx/0xf78efb7c8f9ed8292ab9d123ad22362c70bec053444f2b38c3cc78d063a3aa0d
    const optionType = await OptionType.fromInfo({
      optionInfo: {
        underlyingAsset: '0x618b9a2Db0CF23Bb20A849dAa2963c72770C1372',
        underlyingAmount: 1000000000000n,
        exerciseAsset: '0x8AE0EeedD35DbEFe460Df12A20823eFDe9e03458',
        exerciseAmount: 1575n,
        exerciseTimestamp: 1697443200,
        expiryTimestamp: 1697529600,
      },
      clearinghouse,
    });

    // Validate the option type ID and other properties are set as expected
    expect(optionType.optionTypeId).toEqual(expectedOptionTypeId);
    expect(optionType.optionInfo).toBeDefined();
    expect(optionType.typeExists).toBeTruthy();

    // Ensure that properties specific to options are undefined in OptionType
    expect(optionType.tokenType).not.toBeDefined();
    expect(optionType.tokenId).not.toBeDefined();
  });
});

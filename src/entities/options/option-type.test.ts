import { describe, expect, it } from 'vitest';
import { clearinghouse } from '../../../test';
import { OptionType } from './option-type';

// Expected option type identifier for the test
const expectedOptionTypeId =
  72843026366421500206466009172807756685221693984775973000410191373222805504000n;

describe('Option Class', () => {
  it('Should be able to create an option, and return the correct optionId', async () => {
    // Attempt to create an option type based on provided option information
    // https://arbiscan.io/tx/0xf78efb7c8f9ed8292ab9d123ad22362c70bec053444f2b38c3cc78d063a3aa0d
    const optionType = await OptionType.fromInfo({
      optionInfo: {
        underlyingAsset: '0x9Eb7fE3FA85f44e74e0407d060429e5a11431f3E',
        underlyingAmount: 1000000000000n,
        exerciseAsset: '0xa957Cfc02c20D513aAfA5FaA91A5Ff0068eE2De7',
        exerciseAmount: 2275n,
        exerciseTimestamp: 1703923200,
        expiryTimestamp: 1704009600,
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

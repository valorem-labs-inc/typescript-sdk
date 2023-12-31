import { arbitrumSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { describe, expect, it, vi } from 'vitest';
import { createPromiseClient } from '@connectrpc/connect';
import { Auth, RFQ } from '../../lib';
import { transport } from '../../../test';
import { Trader } from './base-trader';

const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const authClient = createPromiseClient(Auth, transport);
const rfqClient = createPromiseClient(RFQ, transport);

describe('Trader Class', () => {
  it('Should successfully sign in', async () => {
    const errorSpy = vi.spyOn(console, 'error');

    const account = privateKeyToAccount(PRIVATE_KEY);

    // create a Trader instance (essentially a wallet/account/signer, with some utility methods)
    const trader = new Trader({
      account,
      chain: arbitrumSepolia,
      authClient,
      rfqClient,
    });

    await trader.signIn();
    expect(trader.authenticated).toBeTruthy();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

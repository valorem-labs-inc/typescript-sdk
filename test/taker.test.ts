import { createPublicClient, http, createWalletClient } from 'viem';
import { arbitrumGoerli } from 'viem/chains';
import { Taker } from '../src/entities';
import { ValoremSDK } from '../src';
import { privateKeyToAccount } from 'viem/accounts';
import { describe, expect, it, vi } from 'vitest';

const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

describe('Taker Class', () => {
  it('Should fail to sign in due to access pass', async () => {
    const logSpy = vi.spyOn(console, 'log');
    const errorSpy = vi.spyOn(console, 'error');

    const publicClient = createPublicClient({
      chain: arbitrumGoerli,
      transport: http(),
    });
    const walletClient = createWalletClient({
      account: privateKeyToAccount(PRIVATE_KEY),
      chain: arbitrumGoerli,
      transport: http(),
    });

    const valoremSDK = new ValoremSDK({
      publicClient,
      walletClient,
    });

    // create a Taker instance (essentially a wallet/account/signer, with some utility methods)
    const taker = new Taker({
      account: valoremSDK.account!,
      chain: arbitrumGoerli,
    });

    await taker.signIn();
    expect(taker.authenticated).toBeFalsy();

    expect(logSpy).toHaveBeenCalledWith('SIWE Verification failed.');
    expect(errorSpy).toHaveBeenCalledWith(
      '\nGRPC Error: [unknown] [unauthenticated] Access denied: No Access Pass Found. "Address 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 does not hold access pass"\nCode: 2\n',
    );
  });
});

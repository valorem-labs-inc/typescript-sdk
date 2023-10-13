import { arbitrumGoerli } from 'viem/chains';
// import { Taker } from '../src/entities/cli-trader/cli-taker';

const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

describe('Taker Class', () => {
  it.skip('Should fail to sign in due to access pass', async () => {
    // const logSpy = jest.spyOn(console, 'log');
    // const errorSpy = jest.spyOn(console, 'error');
    // const taker = new Taker({
    //   privateKey: PRIVATE_KEY,
    //   chain: arbitrumGoerli,
    // });
    // await taker.signIn();
    // expect(logSpy).toHaveBeenCalledWith('SIWE Verification failed.');
    // expect(errorSpy).toHaveBeenCalledWith(
    //   '\nGRPC Error: [unauthenticated] Access denied: No Access Pass Found. "Address 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 does not hold access pass"\nCode: 16\n',
    // );
  });
});

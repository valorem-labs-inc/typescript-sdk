import type { ParsedQuoteResponse } from '../../grpc';
import type { QuoteRequest } from '../../lib/codegen/rfq_pb';
import { Trader } from './base-trader';
import type { TraderConstructorArgs } from './base-trader';

export class Taker extends Trader {
  public constructor(args: TraderConstructorArgs) {
    super(args);
  }

  public async sendRFQ({
    quoteRequest,
    onQuoteResponse,
    signal,
  }: {
    quoteRequest: QuoteRequest;
    onQuoteResponse: (quoteResponse: ParsedQuoteResponse) => void;
    signal?: AbortSignal;
  }) {
    // eslint-disable-next-line @typescript-eslint/require-await
    const quoteRequestStream = async function* () {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        yield quoteRequest;
      }
    };

    await this.openRFQStream({
      method: 'taker',
      request: quoteRequestStream,
      onQuoteResponse,
      options: {
        timeoutMs: 0,
        signal,
      },
    });
  }
}

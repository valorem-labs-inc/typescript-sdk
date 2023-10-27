import type { ParsedQuoteResponse } from '../../grpc';
import type { QuoteRequest } from '../../lib/codegen/rfq_pb';
import { Trader } from './base-trader';
import type { TraderConstructorArgs } from './base-trader';

export class WebTaker extends Trader {
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
    signal: AbortSignal;
  }) {
    await this.openRFQStream({
      method: 'webTaker',
      request: quoteRequest,
      onQuoteResponse,
      options: {
        timeoutMs: 0,
        signal,
      },
    });
  }
}

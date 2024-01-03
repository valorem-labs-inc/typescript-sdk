import type { ParsedQuoteResponse } from '../../lib/grpc/hi-lo-bit-segmentation/parse-quote-response';
import type { QuoteRequest } from '../../lib/grpc/codegen/rfq_pb';
import { Trader } from './base-trader';
import type { TraderConstructorArgs } from './base-trader';

/**
 * The WebTaker class extends the functionalities of the Trader class
 * and is designed specifically for gRPC-web clients like browsers and React apps.
 * It provides the capability to send and handle RFQs in environments
 * where bidirectional streaming over gRPC is not available.
 */
export class WebTaker extends Trader {
  /**
   * Constructs a new WebTaker instance with the given trading functionalities.
   * @param args - Constructor arguments for the Trader, including GRPC clients and account details.
   */
  public constructor(args: TraderConstructorArgs) {
    super(args);
  }

  /**
   * Sends a Request For Quote (RFQ) and handles the quote response.
   * This method is specifically designed for gRPC-web clients.
   * @param quoteRequest - The RFQ request details.
   * @param onQuoteResponse - Callback function to handle the received quote response.
   * @param signal - An AbortSignal to cancel the request.
   */
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
        timeoutMs: 0, // No timeout for the request.
        signal, // Signal to abort the stream.
      },
    });
  }
}

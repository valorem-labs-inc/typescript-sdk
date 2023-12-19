import type { ParsedQuoteResponse } from '../../grpc/hi-lo-bit-segmentation/parse-quote-response';
import type { QuoteRequest } from '../../lib/codegen/grpc/rfq_pb';
import { Trader } from './base-trader';
import type { TraderConstructorArgs } from './base-trader';

/**
 * The Taker class extends the base Trader functionality, specializing in sending
 * and managing Request For Quotes (RFQs) in the Valorem trading system.
 */
export class Taker extends Trader {
  /**
   * Constructs a Taker instance with the specified trading functionalities.
   * @param args - Constructor arguments for the Trader, including GRPC clients and account details.
   */
  public constructor(args: TraderConstructorArgs) {
    super(args);
  }

  /**
   * Sends a Request For Quote (RFQ) and handles the quote response.
   * @param quoteRequest - The RFQ request details.
   * @param onQuoteResponse - Callback function to handle the received quote response.
   * @param signal - An optional AbortSignal to cancel the request.
   */
  public async sendRFQ({
    quoteRequest,
    onQuoteResponse,
    signal,
  }: {
    quoteRequest: QuoteRequest;
    onQuoteResponse: (quoteResponse: ParsedQuoteResponse) => void;
    signal?: AbortSignal;
  }) {
    // Stream generator for continuously yielding the quote request.
    // TODO(Why?)
    // eslint-disable-next-line @typescript-eslint/require-await
    const quoteRequestStream = async function* () {
      // Continuously yield the same quote request.
      // TODO(Why?)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        yield quoteRequest;
      }
    };

    // Opens an RFQ stream with the specified request and handling.
    await this.openRFQStream({
      method: 'taker',
      request: quoteRequestStream,
      onQuoteResponse,
      options: {
        timeoutMs: 0, // No timeout for the request stream.
        signal, // Optional signal to abort the stream.
      },
    });
  }
}

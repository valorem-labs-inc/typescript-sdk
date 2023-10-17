import { ConnectError } from '@connectrpc/connect';
import { rfqClient, parseQuoteResponse } from '../../utils';
import type { ParsedQuoteResponse } from '../../utils';
import type { QuoteRequest } from '../../lib/codegen/rfq_pb';
import { Trader } from './base-trader';
import type { TraderConstructorArgs } from './base-trader';

export class WebTaker extends Trader {
  public constructor(args: TraderConstructorArgs) {
    super(args);
  }

  public async sendRfqRequests({
    quoteRequest,
    onQuoteResponse,
    signal,
  }: {
    quoteRequest: QuoteRequest;
    onQuoteResponse: (quoteResponse: ParsedQuoteResponse) => void;
    signal: AbortSignal;
  }) {
    // continuously send requests and handle responses
    console.log('Sending RFQs');
    try {
      for await (const quoteResponse of rfqClient.webTaker(quoteRequest, {
        signal,
        timeoutMs: 0,
      })) {
        if (Object.keys(quoteResponse).length === 0) {
          console.log('Received an empty quote response');
          continue;
        }
        if (!quoteResponse.order || !quoteResponse.seaportAddress) {
          console.log('Received an invalid quote response');
          continue;
        }
        // parse the response
        try {
          const parsedQuoteResponse = parseQuoteResponse(quoteResponse);
          console.log('Received a valid quote response!');
          onQuoteResponse(parsedQuoteResponse);
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      if (error instanceof ConnectError) {
        const connectError = ConnectError.from(error);
        if (!connectError.rawMessage.includes('This operation was aborted')) {
          console.log(error);
        }
      }
    }
    console.log('Stream closed');
  }
}

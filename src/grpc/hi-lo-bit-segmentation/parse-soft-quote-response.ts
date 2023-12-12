import { pad, toHex, zeroAddress } from 'viem';
import { NULL_BYTES32 } from '../../constants';
import type { SoftQuoteResponse } from '../../lib';
import { fromH128, fromH160ToAddress, fromH256 } from './hi-lo-to-big-int';

export type ParsedSoftQuoteResponse = ReturnType<typeof parseSoftQuoteResponse>;

/**
 * Parses a QuoteResponse from the RFQ service of the Valorem Trade API,
 * transforming it into a more usable format and performing necessary validations.
 *
 * @param res - The raw quote response received from the RFQ service.
 * @returns - An object representing the parsed quote response.
 * @throws - Errors if the response is missing essential data.
 */
export const parseSoftQuoteResponse = (res: SoftQuoteResponse) => {
  // Validate the presence of required fields in the response.
  if (!res.seaportAddress)
    throw new Error(
      'Invalid response from RFQ server. Missing seaport address.',
    );
  if (!res.order?.offerer)
    throw new Error(
      'Invalid response from RFQ server. Missing order parameters.',
    );

  if (!res.order.zone)
    throw new Error(
      'Invalid response from RFQ server. Missing order params: zone.',
    );
  if (!res.order.offer)
    throw new Error(
      'Invalid response from RFQ server. Missing order params: offer.',
    );
  if (!res.order.consideration)
    throw new Error(
      'Invalid response from RFQ server. Missing order params: consideration.',
    );
  if (!res.order.orderType)
    throw new Error(
      'Invalid response from RFQ server. Missing order params: orderType.',
    );
  if (!res.order.startTime)
    throw new Error(
      'Invalid response from RFQ server. Missing order params: startTime.',
    );
  if (!res.order.endTime)
    throw new Error(
      'Invalid response from RFQ server. Missing order params: endTime.',
    );

  if (!res.chainId)
    throw new Error(
      'Invalid response from RFQ server. Missing order params: chainId.',
    );

  if (!res.ulid)
    throw new Error(
      'Invalid response from RFQ server. Missing order params: ulid.',
    );
  if (!res.makerAddress)
    throw new Error(
      'Invalid response from RFQ server. Missing order params: makerAddress.',
    );

  const parsedSoftQuoteResponse = {
    ulid: fromH128(res.ulid),
    makerAddress: fromH160ToAddress(res.makerAddress),
    chainId: res.chainId ? Number(fromH256(res.chainId).toString()) : undefined,
    seaportAddress: fromH160ToAddress(res.seaportAddress),
    order: {
      offerer: fromH160ToAddress(res.order.offerer),
      zone: res.order.zone ? fromH160ToAddress(res.order.zone) : zeroAddress,
      offer: res.order.offer.map((o) => {
        return {
          itemType: o.itemType,
          token: o.token ? fromH160ToAddress(o.token) : zeroAddress,
          identifierOrCriteria: o.identifierOrCriteria
            ? fromH256(o.identifierOrCriteria)
            : 0n,
          startAmount: o.startAmount ? fromH256(o.startAmount) : 0n,
          endAmount: o.endAmount ? fromH256(o.endAmount) : 0n,
        };
      }),
      consideration: res.order.consideration.map((c) => {
        return {
          itemType: c.itemType,
          token: c.token ? fromH160ToAddress(c.token) : zeroAddress,
          identifierOrCriteria: c.identifierOrCriteria
            ? fromH256(c.identifierOrCriteria)
            : 0n,
          startAmount: c.startAmount ? fromH256(c.startAmount) : 0n,
          endAmount: c.endAmount ? fromH256(c.endAmount) : 0n,
          recipient: c.recipient ? fromH160ToAddress(c.recipient) : zeroAddress,
        };
      }),
      orderType: res.order.orderType,
      startTime: fromH256(res.order.startTime),
      endTime: fromH256(res.order.endTime),
      zoneHash: res.order.zoneHash
        ? pad(toHex(fromH256(res.order.zoneHash)), {
            size: 32,
          })
        : NULL_BYTES32,
      salt: res.order.salt ? fromH256(res.order.salt) : 0n,
      conduitKey: res.order.conduitKey
        ? pad(toHex(fromH256(res.order.conduitKey)), {
            size: 32,
          })
        : NULL_BYTES32,
    },
  };

  // Additional validation checks for consideration and offer.

  if (!parsedSoftQuoteResponse.order.consideration[0]) {
    throw new Error('Invalid response from RFQ server. Missing consideration.');
  }

  if (!parsedSoftQuoteResponse.order.offer[0]) {
    throw new Error('Invalid response from RFQ server. Missing offer.');
  }

  return parsedSoftQuoteResponse;
};

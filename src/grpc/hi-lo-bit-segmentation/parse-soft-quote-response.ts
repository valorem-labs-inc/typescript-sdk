import { pad, toHex, zeroAddress } from 'viem';
import { NULL_BYTES32 } from '../../constants';
import type { SoftQuoteResponse } from '../../lib/codegen/grpc/soft_quote_pb';
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
export const parseSoftQuoteResponse = (res: Partial<SoftQuoteResponse>) => {
  if (
    (res.order as undefined | Partial<SoftQuoteResponse['order']>)?.offer ===
      undefined ||
    (res.order as undefined | Partial<SoftQuoteResponse['order']>)
      ?.consideration === undefined
  ) {
    throw new Error('Invalid response from RFQ server. Missing order params.');
  }

  if (res.order?.offer.length === 0 || res.order?.consideration.length === 0) {
    throw new Error('Invalid response from RFQ server. Empty array.');
  }

  const parsedSoftQuoteResponse = {
    ulid: res.ulid !== undefined ? fromH128(res.ulid) : undefined,
    makerAddress:
      res.makerAddress !== undefined
        ? fromH160ToAddress(res.makerAddress)
        : undefined,
    chainId:
      res.chainId !== undefined
        ? Number(fromH256(res.chainId).toString())
        : undefined,
    seaportAddress:
      res.seaportAddress !== undefined
        ? fromH160ToAddress(res.seaportAddress)
        : undefined,
    order: {
      offerer:
        res.order?.offerer !== undefined
          ? fromH160ToAddress(res.order.offerer)
          : undefined,
      zone:
        res.order?.zone !== undefined
          ? fromH160ToAddress(res.order.zone)
          : undefined,
      offer: res.order?.offer.map((o) => ({
        itemType: o.itemType,
        token: o.token ? fromH160ToAddress(o.token) : zeroAddress,
        identifierOrCriteria: o.identifierOrCriteria
          ? fromH256(o.identifierOrCriteria)
          : 0n,
        startAmount: o.startAmount ? fromH256(o.startAmount) : 0n,
        endAmount: o.endAmount ? fromH256(o.endAmount) : 0n,
      })),
      consideration: res.order?.consideration.map((c) => ({
        itemType: c.itemType,
        token: c.token ? fromH160ToAddress(c.token) : zeroAddress,
        identifierOrCriteria: c.identifierOrCriteria
          ? fromH256(c.identifierOrCriteria)
          : 0n,
        startAmount: c.startAmount ? fromH256(c.startAmount) : 0n,
        endAmount: c.endAmount ? fromH256(c.endAmount) : 0n,
        recipient: c.recipient ? fromH160ToAddress(c.recipient) : zeroAddress,
      })),
      orderType: res.order?.orderType,
      startTime:
        res.order?.startTime !== undefined
          ? fromH256(res.order.startTime)
          : undefined,
      endTime:
        res.order?.endTime !== undefined
          ? fromH256(res.order.endTime)
          : undefined,
      zoneHash: res.order?.zoneHash
        ? pad(toHex(fromH256(res.order.zoneHash)), { size: 32 })
        : NULL_BYTES32,
      salt: res.order?.salt ? fromH256(res.order.salt) : 0n,
      conduitKey: res.order?.conduitKey
        ? pad(toHex(fromH256(res.order.conduitKey)), { size: 32 })
        : NULL_BYTES32,
    },
  };

  return parsedSoftQuoteResponse;
};

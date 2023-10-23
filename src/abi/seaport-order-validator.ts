export const SEAPORT_VALIDATOR_ABI = [
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'offerer', type: 'address' },
              { internalType: 'address', name: 'zone', type: 'address' },
              {
                components: [
                  {
                    internalType: 'enum ItemType',
                    name: 'itemType',
                    type: 'uint8',
                  },
                  { internalType: 'address', name: 'token', type: 'address' },
                  {
                    internalType: 'uint256',
                    name: 'identifierOrCriteria',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'startAmount',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'endAmount',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct OfferItem[]',
                name: 'offer',
                type: 'tuple[]',
              },
              {
                components: [
                  {
                    internalType: 'enum ItemType',
                    name: 'itemType',
                    type: 'uint8',
                  },
                  { internalType: 'address', name: 'token', type: 'address' },
                  {
                    internalType: 'uint256',
                    name: 'identifierOrCriteria',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'startAmount',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'endAmount',
                    type: 'uint256',
                  },
                  {
                    internalType: 'address payable',
                    name: 'recipient',
                    type: 'address',
                  },
                ],
                internalType: 'struct ConsiderationItem[]',
                name: 'consideration',
                type: 'tuple[]',
              },
              {
                internalType: 'enum OrderType',
                name: 'orderType',
                type: 'uint8',
              },
              { internalType: 'uint256', name: 'startTime', type: 'uint256' },
              { internalType: 'uint256', name: 'endTime', type: 'uint256' },
              { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
              { internalType: 'uint256', name: 'salt', type: 'uint256' },
              { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
              {
                internalType: 'uint256',
                name: 'totalOriginalConsiderationItems',
                type: 'uint256',
              },
            ],
            internalType: 'struct OrderParameters',
            name: 'parameters',
            type: 'tuple',
          },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct Order',
        name: 'order',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: 'seaportAddress',
        type: 'address',
      },
    ],
    name: 'isValidOrder',
    outputs: [
      {
        components: [
          { internalType: 'uint16[]', name: 'errors', type: 'uint16[]' },
          { internalType: 'uint16[]', name: 'warnings', type: 'uint16[]' },
        ],
        internalType: 'struct ErrorsAndWarnings',
        name: 'errorsAndWarnings',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

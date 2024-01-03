import { graphql } from './codegen';

export const optionsByAccountQuery = graphql(/* GraphQL */ `
  query OptionPositions($account: ID!) {
    account(id: $account) {
      ERC1155balances {
        id
        token {
          id
          type
          claim {
            id
            amountWritten
            amountExercised
            optionType {
              id
              underlyingAsset {
                symbol
              }
              underlyingAmount
              exerciseAsset {
                symbol
              }
              exerciseAmount
              exerciseTimestamp
              expiryTimestamp
            }
            redeemed
          }
          optionType {
            id
            underlyingAsset {
              symbol
            }
            underlyingAmount
            exerciseAsset {
              symbol
            }
            exerciseAmount
            exerciseTimestamp
            expiryTimestamp
          }
        }
        valueExact
      }
    }
  }
`);

export const positionByIDTotalSupplyQuery = graphql(/* GraphQL */ `
  query TotalSupplyOptionPosition($tokenId: ID!) {
    erc1155Token(id: $tokenId) {
      id
      balances {
        id
        token {
          id
          type
          claim {
            id
            amountWritten
            amountExercised
            optionType {
              id
              underlyingAsset {
                symbol
              }
              underlyingAmount
              exerciseAsset {
                symbol
              }
              exerciseAmount
              exerciseTimestamp
              expiryTimestamp
            }
            redeemed
          }
          optionType {
            id
            underlyingAsset {
              symbol
            }
            underlyingAmount
            exerciseAsset {
              symbol
            }
            exerciseAmount
            exerciseTimestamp
            expiryTimestamp
          }
        }
        valueExact
      }
    }
  }
`);

export const positionByOwnerAndIDQuery = graphql(/* GraphQL */ `
  query OwnedOptionPosition($tokenId: ID!, $owner: ID!) {
    account(id: $owner) {
      ERC1155balances(where: { id: $tokenId }) {
        id
        token {
          id
          type
          claim {
            id
            amountWritten
            amountExercised
            optionType {
              id
              underlyingAsset {
                symbol
              }
              underlyingAmount
              exerciseAsset {
                symbol
              }
              exerciseAmount
              exerciseTimestamp
              expiryTimestamp
            }
            redeemed
          }
          optionType {
            id
            underlyingAsset {
              symbol
            }
            underlyingAmount
            exerciseAsset {
              symbol
            }
            exerciseAmount
            exerciseTimestamp
            expiryTimestamp
          }
        }
        valueExact
      }
    }
  }
`);

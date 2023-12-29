import type { OptionPositionsQuery } from './codegen/graphql';

export type SubgraphOptionPosition = Required<
  NonNullable<OptionPositionsQuery['account']>['ERC1155balances'][number]
>;

export type SubgraphClaimERC1155 = NonNullable<
  SubgraphOptionPosition['token']['claim']
>;

export type SubgraphOptionType = NonNullable<
  | SubgraphOptionPosition['token']['optionType']
  | SubgraphClaimERC1155['optionType']
>;

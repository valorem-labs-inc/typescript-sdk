This is a work in progress. The API is not yet stable, and is subject to change, including breaking changes. Contributions welcome.

# Valorem TypeScript SDK

This is a TypeScript SDK for interacting with Valorem's smart contracts and Trade API.

## Installation

```bash
npm i @valorem-labs-inc/sdk
```

```bash
pnpm i @valorem-labs-inc/sdk
```

```bash
yarn add @valorem-labs-inc/sdk
```

## Getting Started

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumGoerli } from 'viem/chains';
import { ValoremSDK } from '@valorem-labs-inc/sdk';

// set up viem clients
const account = privateKeyToAccount(YOUR_PRIVATE_KEY);
const publicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
});
const walletClient = createWalletClient({
  account,
  chain: arbitrumGoerli,
  transport: http(),
});

// init Valorem SDK
const valoremSDK = new ValoremSDK({
  publicClient,
  walletClient,
});
```

## Usage

```typescript
const webTaker = valoremSDK.webTaker;
await webTaker.signIn();
// now you can send requests to the Trade API
```

A full example of using the Valorem Typescript SDK to create an option, request a quote, and fulfill a trade order is located here: [@valorem-labs-inc/trade-interfaces/examples/typescript/src/RFQ_taker.ts](https://github.com/valorem-labs-inc/trade-interfaces/blob/main/examples/typescript/src/RFQ_taker.ts).

## Documentation

For documentation, visit [https://valorem-labs-inc.github.io/typescript-sdk/](https://valorem-labs-inc.github.io/typescript-sdk/)

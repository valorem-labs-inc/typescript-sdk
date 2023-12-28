# Valorem TypeScript SDK

> This TypeScript SDK provides a streamlined interface for interacting with Valorem's smart
> contracts and Trade API, enabling developers to build applications on top of Valorem's
> infrastructure with ease. Please note that this SDK is a work in progress, and the API is
> subject to change, including potential breaking changes.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Examples](#examples)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the Valorem TypeScript SDK, choose your package manager and run the appropriate command:

Using npm:

```bash
npm i @valorem-labs-inc/sdk
```

Using pnpm:

```bash
pnpm i @valorem-labs-inc/sdk
```

Using yarn:

```bash
yarn add @valorem-labs-inc/sdk
```

## Getting Started

To get started with the SDK, you'll need to set up the necessary clients from Viem and initialize
the ValoremSDK. Here's a quick start guide:

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { ValoremSDK } from '@valorem-labs-inc/sdk';

// Replace YOUR_PRIVATE_KEY with your Ethereum private key.
const account = privateKeyToAccount(YOUR_PRIVATE_KEY);

// Set up Viem clients for the Arbitrum Sepolia test network.
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

const walletClient = createWalletClient({
  account,
  chain: arbitrumSepolia,
  transport: http(),
});

// Initialize the Valorem SDK with the created clients.
const valoremSDK = new ValoremSDK({
  publicClient,
  walletClient,
});
```

## Usage

Here's how you can sign in and send requests to the Trade API using the SDK:

```typescript
const webTaker = valoremSDK.webTaker;

// Sign in to the Trade API.
await webTaker.signIn();

// Now you can send requests to the Trade API.
```

Yes, it's really that easy.

## Examples

For a comprehensive example of using the Valorem TypeScript SDK to create options,
request quotes, and fulfill trade orders, check out the [example file](https://github.com/valorem-labs-inc/trade-interfaces/blob/main/examples/typescript/src/RFQ_taker.ts).

## Documentation

Documentation for the Valorem TypeScript SDK is available [here](https://valorem-labs-inc.github.io/typescript-sdk/).

## Contributing

We welcome contributions to the Valorem TypeScript SDK!
If you have suggestions, bug reports, or contributions, please submit them
as issues or pull requests in the repository.

To update the version of a package:

1. Make sure `@changesets/cli` is installed locally
2. Then run `pnpm changeset` in your terminal to write a changelog update
3. Then `pnpm changeset version` to to compile changes into changelog.md and bump version
4. Finally run `pnpm build && pnpm publish --no-git-checks --tag alpha` to publish

## License

The Valorem TypeScript SDK is licensed under the MIT License.
See the [LICENSE](LICENSE) file for more details.

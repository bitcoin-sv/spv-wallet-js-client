<div align="center">

# [SPV Wallet: JS Client](https://www.npmjs.com/package/@bsv/spv-wallet-js-client)

[![last commit](https://img.shields.io/github/last-commit/bitcoin-sv/spv-wallet-js-client.svg?style=flat&v=2)](https://github.com/bitcoin-sv/spv-wallet-js-client/commits/main)
[![version](https://img.shields.io/github/release-pre/bitcoin-sv/spv-wallet-js-client.svg?style=flat&v=2)](https://github.com/bitcoin-sv/spv-wallet-js-client/releases)
[![Npm](https://img.shields.io/npm/v/@bsv/spv-wallet-js-client?style=flat&v=2)](https://www.npmjs.com/package/@bsv/spv-wallet-js-client)
[![license](https://img.shields.io/badge/license-Open%20BSV-brightgreen.svg?style=flat&v=2)](/LICENSE)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://api.mergify.com/v1/badges/bitcoin-sv/spv-wallet-js-client&style=flat&v=2)](https://mergify.io)
<br/>
</div>

## Table of Contents

- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Development](#development)
- [Code Standards](#code-standards)
- [Contributing](#contributing)
- [License](#license)

## About

**SPV Wallet: JS Client** is a TypeScript package which acts as a http client to [SPV Wallet](https://github.com/bitcoin-sv/spv-wallet).
Using this library, you can build your own solutions that utilize this non-custodial wallet.

For comprehensive information and guidance, please refer to the [SPV Wallet Documentation](https://docs.bsvblockchain.org/network-topology/applications/spv-wallet).

### Key features

- Sending transactions (standard and OP_RETURN);
- Listing transactions, UTXOs, destinations;
- Getting balance;
- Managing SPV Wallet as an admin;
  - Registering xPubs;
  - Creating Paymails;
- Generating keys (xPriv, xPub).

## Installation

To use this package in your application, you can add it using `yarn`.

```bash
yarn add @bsv/spv-wallet-js-client
```

## Usage

You can find the examples of usage in the [examples](./examples) directory.

The main concept is to create a new instance of either `SPVWalletUserAPI` for user operations or `SPVWalletAdminAPI` for admin operations.

```typescript
import { SPVWalletUserAPI, SPVWalletAdminAPI } from '@bsv/spv-wallet-js-client';

const spvWalletServerUrl = 'http://localhost:3003';

// Create a new instance of the SPV Wallet user client
const userClient = new SPVWalletUserAPI(spvWalletServerUrl, {
  // connecting with the xPriv is one of the options (see below)
  xPriv: 'xpriv.....',
});

// Create a new instance of the SPV Wallet admin client
const adminClient = new SPVWalletAdminAPI(spvWalletServerUrl, 'adminKey.....');

// Use the client to interact with the SPV Wallet server
// For example, check the balance
const userInfo = await userClient.xPub();
console.log('Current balance:', userInfo.currentBalance);
```

> During creation or usage of the client an exception can be thrown - see [handle-exceptions example](./examples/handle-exceptions.ts) how to handle these situations.
> Additionally you can check [./src/errors.ts](./src/errors.ts) file where custom errors are defined.

## Options

### SPV Wallet URL

The **first argument** of both `SPVWalletUserAPI` and `SPVWalletAdminAPI` constructors is the URL of the SPV Wallet server.

> Note the `/api/v1` or /v1 suffix is not required, it will be resolved automatically.

### Keys configuration

For `SPVWalletUserAPI`, the **second argument** is an object which is responsible for configuring what key to use.
It is typescripted so it will help you with the options.

To make user requests, you need to provide **one** of the following options:

- `xPriv` string - which allows you to make all non-admin requests
- `accessKey` string - same as `xPriv` but without the ability to call methods: `finalizeTransaction` and `sendToRecipients`
- `xPub` string - in this case, your requests will not be signed and you also won't be able to call `finalizeTransaction` and `sendToRecipients`

For `SPVWalletAdminAPI`, the **second argument** is simply the admin key string.

See the examples of different ways to create the clients:

```typescript
const userClient = new SPVWalletUserAPI(spvWalletServerUrl, {
  // all non-admin requests will work
  xPriv: 'xpriv.....',
});

const userClient = new SPVWalletUserAPI(spvWalletServerUrl, {
  // all non-admin requests will work except finalizeTransaction and sendToRecipients
  accessKey: 'accesskey.....',
});

const userClient = new SPVWalletUserAPI(spvWalletServerUrl, {
  // part non-admin requests will work and they will not be signed
  xPub: 'xpub.....',
});

const adminClient = new SPVWalletAdminAPI(spvWalletServerUrl, 'adminkey.....');
```

### Optional logger configuration

The **third optional argument** is responsible for a logger configuration.
You can either configure log level (default `info`) or provide your own logger which implements `Logger interface` (see [./src/logger.ts](./src/logger.ts))

Unless you provide your own logger, the standard `console` will be used.

> To disable logging, you can set the log level to `disabled`.

Check the example presenting how to define [custom-logger](./examples/custom-logger.ts).

## Development

This package is based on [rollup.js](https://rollupjs.org/) which handles configuration, hot-reloading and making a build.

To run the package for develompent purposes, make sure you've installed all dependencies with `yarn install`, then just run:

```bash
yarn dev
```

After that, in the `dist` directory, compiled package should appear. Additionally, `rollup` will observe the source files rebuilding the dist if needed (hot-reloading).

You can test your changes locally, the same way as our examples are run. You can find them in [examples](./examples) directory.

### Build the package

To build the package use

```bash
yarn build
```

See more scripts in the [package.json](package.json) file or the [makefile](Makefile).

<details>
<summary><strong><code>Library Deployment</code></strong></summary>
<br/>

Releases are automatically created when you create a new [git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging)!

If you want to manually make releases, please install GoReleaser:

[goreleaser](https://github.com/goreleaser/goreleaser) for easy binary or library deployment to Github and can be installed:

- **using make:** `make install-releaser`
- **using brew:** `brew install goreleaser`

The [.goreleaser.yml](.goreleaser.yml) file is used to configure [goreleaser](https://github.com/goreleaser/goreleaser).

<br/>

### Automatic Releases on Tag Creation (recommended)

Automatic releases via [Github Actions](.github/workflows/release.yml) from creating a new tag:

```shell
make tag version=1.2.3
```

<br/>

### Manual Releases (optional)

Use `make release-snap` to create a snapshot version of the release, and finally `make release` to ship to production (manually).

<br/>

</details>

<details>
<summary><strong><code>Makefile Commands</code></strong></summary>
<br/>

View all `makefile` commands

```shell script
make help
```

List of all current commands:

```text
audit                         Checks for vulnerabilities in dependencies
clean                         Remove previous builds and any test cache data
help                          Show this help message
install                       Installs the dependencies for the package
install-all-contributors      Installs all contributors locally
outdated                      Checks for outdated packages via npm
publish                       Will publish the version to npm
release                       Full production release (creates release in Github)
release                       Run after releasing - deploy to npm
release-snap                  Test the full release (build binaries)
release-test                  Full production test release (everything except deploy)
replace-version               Replaces the version in HTML/JS (pre-deploy)
tag                           Generate a new tag and push (tag version=0.0.0)
tag-remove                    Remove a tag if found (tag-remove version=0.0.0)
tag-update                    Update an existing tag to current commit (tag-update version=0.0.0)
test                          Will run unit tests
update-contributors           Regenerates the contributors html/list
```

</details>

## Code Standards

Please read our [code standards document](.github/CODE_STANDARDS.md)

## Contributing

All kinds of contributions are welcome!
<br/>
To get started, take a look at [code standards](.github/CODE_STANDARDS.md).
<br/>
View the [contributing guidelines](.github/CODE_STANDARDS.md#3-contributing) and follow the [code of conduct](.github/CODE_OF_CONDUCT.md).

<br/>

## License

[![License](https://img.shields.io/badge/license-Open%20BSV-brightgreen.svg?style=flat&v=2)](/LICENSE)

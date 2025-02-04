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
- [Client Usage](#client-usage)
- [Admin Usage](#admin-usage)
- [Development](#development)
- [Code Standards](#code-standards)
- [Contributing](#contributing)
- [License](#license)

## About

**SPV Wallet: JS Client** is a TypeScript package which acts as a http client to [SPV Wallet](https://github.com/bitcoin-sv/spv-wallet).
Using this library, you can build your own solutions that utilize this non-custodial wallet.

For comprehensive information and guidance, please refer to the [SPV Wallet Documentation](https://docs.bsvblockchain.org/network-topology/applications/spv-wallet).

### Client Features (SPVWalletUserAPI)
- Managing transactions (draft, send, finalize)
- Listing and managing UTXOs
- Managing contacts and paymails
- Generating and managing access keys
- Handling merkle roots
- Managing user xPub information

### Admin Features (SPVWalletAdminAPI) 
- Managing xPubs (create, list)
- Managing paymails (create, delete, list)
- Managing contacts (create, update, delete)
- Viewing transactions and UTXOs
- Managing webhooks
- Accessing server statistics
- Managing system configurations

## Installation

To use this package in your application, you can add it using `yarn`.

```bash
yarn add @bsv/spv-wallet-js-client
```

## Client Usage

The client API provides standard wallet operations for end users.

```typescript
import { SPVWalletUserAPI } from '@bsv/spv-wallet-js-client';

const spvWalletServerUrl = 'http://localhost:3003';

// Create a new instance of the SPV Wallet user client
const userClient = new SPVWalletUserAPI(spvWalletServerUrl, {
  xPriv: 'xpriv.....',
});

// Example: Get user balance
const userInfo = await userClient.xPub();
console.log('Current balance:', userInfo.currentBalance);
```

> During creation or usage of the client an exception can be thrown - see [handle-exceptions example](./examples/handle-exceptions.ts) how to handle these situations.
> Additionally you can check [./src/errors.ts](./src/errors.ts) file where custom errors are defined.

### Client Options

To make user requests, provide one of:
- `xPriv` string - Full access to non-admin operations
- `accessKey` string - Limited access (no transaction finalization/sending)
- `xPub` string - Read-only access with unsigned requests

```typescript
// Full access with xPriv
const userClient = new SPVWalletUserAPI(spvWalletServerUrl, {
  xPriv: 'xpriv.....',
});

// Limited access with accessKey
const userClient = new SPVWalletUserAPI(spvWalletServerUrl, {
  accessKey: 'accesskey.....',
});

// Read-only access with xPub
const userClient = new SPVWalletUserAPI(spvWalletServerUrl, {
  xPub: 'xpub.....',
});
```

## Admin Usage

The admin API provides administrative operations for managing the SPV Wallet system.

```typescript
import { SPVWalletAdminAPI } from '@bsv/spv-wallet-js-client';

const spvWalletServerUrl = 'http://localhost:3003';

// Create a new instance of the SPV Wallet admin client
const adminClient = new SPVWalletAdminAPI(spvWalletServerUrl, 'adminkey.....');

// Example: Get server statistics
const stats = await adminClient.stats();
console.log('Server stats:', stats);
```

### Admin Options

Admin operations require an admin key string as the second parameter when initializing the client:

```typescript
const adminClient = new SPVWalletAdminAPI(spvWalletServerUrl, 'adminkey.....');
```

### Optional Logger Configuration

Both client and admin APIs accept an optional logger configuration:
```typescript
const client = new SPVWalletUserAPI(url, options, {
  level: 'debug' // or 'info', 'warn', 'error', 'disabled'
});
```

You can also provide a custom logger implementing the `Logger` interface.

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

<div align="center">

# [SPV Wallet: JS Client](https://www.npmjs.com/package/@bitcoin-sv/spv-wallet-js-client)

[![last commit](https://img.shields.io/github/last-commit/bitcoin-sv/spv-wallet-js-client.svg?style=flat&v=2)](https://github.com/bitcoin-sv/spv-wallet-js-client/commits/master)
[![version](https://img.shields.io/github/release-pre/bitcoin-sv/spv-wallet-js-client.svg?style=flat&v=2)](https://github.com/bitcoin-sv/spv-wallet-js-client/releases)
[![Npm](https://img.shields.io/npm/v/@bitcoin-sv/spv-wallet-js-client?style=flat&v=2)](https://www.npmjs.com/package/@bitcoin-sv/spv-wallet-js-client)
[![license](https://img.shields.io/badge/license-Open%20BSV-brightgreen.svg?style=flat&v=2)](/LICENSE)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://api.mergify.com/v1/badges/bitcoin-sv/spv-wallet-js-client&style=flat&v=2)](https://mergify.io)
<br/>
</div>

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [About](#about)
- [Code Standards](#code-standards)
- [Contributing](#contributing)
- [License](#license)

<br />

## Installation

Install all npm packages
```bash
$ yarn install
```

See more scripts in the [package.json](package.json) file or the [makefile](Makefile).

> There is a peer dependency on the [bsv library](https://github.com/moneybutton/bsv/tree/bsv-legacy).
> This version of the SPV Wallet JS Client supports version `1.x` of the [bsv library](https://github.com/moneybutton/bsv/tree/bsv-legacy).

<br />

### Connection options

| Option          |  Description                                    |                     |
|-----------------|-------------------------------------------------|---------------------|
| accessKeyString | Hex private part of an access key               | string              |
| debug           | Whether to turn debugging on                    | boolean             |
| signRequest     | Whether to sign all requests sent to the server | boolean             |
| transportType   | Transport type to use for server requests       | "http" or "graphql" |
| xPriv           | bsv HDPrivateKey instance                       |                     |
| xPrivString     | HD Private key string                           | "xprv....."         |
| xPub            | bsv HD Public key instance                      |                     |
| xPubString      | HD Public key string                            | "xpub....."         |

<br />

### Connection as an SPV Wallet admin

You can add the admin key to the SPV Wallet client after initialisation to support admin requests (IE: registering an xPub).

```javascript
const adminKey = 'xprv.....';
client.SetAdminKey(adminKey);
```

<br />

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

<br />

## Usage

```javascript
import { SpvWalletClient, generateKeys } from 'spv-wallet-js-client';

const server = "http://localhost:3003/v1";
const transportType = 'http'; // or graphql
const xPriv = generateKeys().xPriv()

const client = new SpvWalletClient(server, {
  signRequest: true,
  transportType,
  xPriv,
});

const recipients = [{
  to: "test@handcash.io",
  satoshis: 10000,
}];
const result = await client.SendToRecipients(recipients, { agent: 'Spv Wallet test' })
```

<br />

## About
For comprehensive information and guidance on the [SPV Wallet Documentation](https://bsvblockchain.gitbook.io/docs).

## Code Standards
Please read our [code standards document](.github/CODE_STANDARDS.md)

<br />

## Contributing
All kinds of contributions are welcome!
<br/>
To get started, take a look at [code standards](.github/CODE_STANDARDS.md).
<br/>
View the [contributing guidelines](.github/CODE_STANDARDS.md#3-contributing) and follow the [code of conduct](.github/CODE_OF_CONDUCT.md).

<br/>

## License
[![License](https://img.shields.io/badge/license-Open%20BSV-brightgreen.svg?style=flat&v=2)](/LICENSE)

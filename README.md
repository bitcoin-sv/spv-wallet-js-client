# [BUX: JS Client](https://www.npmjs.com/package/@buxorg/js-buxclient)
> Get started using [BUX](https://getbux.io) in five minutes

[![last commit](https://img.shields.io/github/last-commit/BuxOrg/js-buxclient.svg?style=flat&v=2)](https://github.com/BuxOrg/js-buxclient/commits/master)
[![version](https://img.shields.io/github/release-pre/BuxOrg/js-buxclient.svg?style=flat&v=2)](https://github.com/BuxOrg/js-buxclient/releases)
[![Npm](https://img.shields.io/npm/v/@buxorg/js-buxclient?style=flat&v=2)](https://www.npmjs.com/package/@buxorg/js-buxclient)
[![license](https://img.shields.io/badge/license-Open%20BSV-brightgreen.svg?style=flat&v=2)](/LICENSE)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://api.mergify.com/v1/badges/BuxOrg/js-buxclient&style=flat&v=2)](https://mergify.io)
[![Sponsor](https://img.shields.io/badge/sponsor-BuxOrg-181717.svg?logo=github&style=flat&v=2)](https://github.com/sponsors/BuxOrg)

## Table of Contents
- [What is BUX?](#what-is-bux)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Code Standards](#code-standards)
- [Contributing](#contributing)
- [License](#license)

<br />

## What is BUX?
[Read more about BUX](https://getbux.io)

<br />

## Installation

Install all npm packages
```bash
$ yarn install
```

See more scripts in the [package.json](package.json) file or the [makefile](Makefile).

> There is a peer dependency on the [bsv library](https://github.com/moneybutton/bsv/tree/bsv-legacy).
> This version of the JS BUX client supports version `1.x` of the [bsv library](https://github.com/moneybutton/bsv/tree/bsv-legacy).

<br />

## Usage
Here's the [getting started](https://getbux.io) with BUX

```javascript
import bsv from 'bsv';
import { BuxClient } from 'js-buxclient';

const server = "http://localhost:3003/v1";
const transportType = 'http'; // or graphql
const xPriv = bsv.HDPrivateKey.fromRandom();

const buxClient = new BuxClient(server, {
  signRequest: true,
  transportType,
  xPriv,
});

const recipients = [{
  to: "test@handcash.io",
  satoshis: 10000,
}];
const result = await buxClient.SendToRecipients(recipients, { agent: 'Bux test' })
```

<br />

## Documentation
View more [BUX documentation](https://getbux.io).

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

### Connection as a BUX admin

You can add the admin key to the BUX client after initialisation to support admin requests (IE: registering an xPub).

```javascript
const adminKey = 'xprv.....';
buxClient.SetAdminKey(adminKey);
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

## Code Standards
Please read our [code standards document](.github/CODE_STANDARDS.md)

<br />

## Contributing
View the [contributing guidelines](.github/CONTRIBUTING.md) and follow the [code of conduct](.github/CODE_OF_CONDUCT.md).

<br/>

### How can I help?
All kinds of contributions are welcome :raised_hands:!
The most basic way to show your support is to star :star2: the project, or to raise issues :speech_balloon:.
You can also support this project by [becoming a sponsor on GitHub](https://github.com/sponsors/BuxOrg) :clap:
or by making a [**bitcoin donation**](https://getbux.io/#sponsor?utm_source=github&utm_medium=sponsor-link&utm_campaign=js-buxclient&utm_term=js-buxclient&utm_content=js-buxclient) to ensure this journey continues indefinitely! :rocket:

[![Stars](https://img.shields.io/github/stars/BuxOrg/js-buxclient?label=Please%20like%20us&style=social&v=2)](https://github.com/BuxOrg/js-buxclient/stargazers)

<br/>

### Contributors ✨
Thank you to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/icellan"><img src="https://avatars.githubusercontent.com/u/4411176?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Siggi</b></sub></a><br /><a href="#infra-icellan" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/BuxOrg/js-buxclient/commits?author=icellan" title="Code">💻</a> <a href="#security-icellan" title="Security">🛡️</a></td>
    <td align="center"><a href="https://mrz1818.com"><img src="https://avatars.githubusercontent.com/u/3743002?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mr. Z</b></sub></a><br /><a href="#infra-mrz1836" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/BuxOrg/js-buxclient/commits?author=mrz1836" title="Code">💻</a> <a href="#maintenance-mrz1836" title="Maintenance">🚧</a> <a href="#business-mrz1836" title="Business development">💼</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

> This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.


<br />

## License
[![License](https://img.shields.io/badge/license-Open%20BSV-brightgreen.svg?style=flat&v=2)](/LICENSE)

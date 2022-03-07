# JavaScript Bux client
Connect to a bux server from JavaScript

## Usage

There is a peer dependency on the [bsv](https://github.com/moneybutton/bsv/tree/bsv-legacy) library. This version of the JS Bux client
supports version 1.x of the bsv library.

```javascript
import bsv from 'bsv';
import BuxClient from 'js-buxclient';

const server = "http://localhost:3003/v1"
const transportType = 'http'; // or graphql
const Xpriv = bsv.HDPrivateKey.fromRandom();

const buxClient = new BuxClient(server, {
  transportType,
  xPriv,
  signRequest: true,
});
```

## Connection options

| Option          |  Description                                    |                     |
|-----------------|-------------------------------------------------|---------------------|
| transportType   | Transport type to use for server requests       | "http" or "graphql" |
| xPriv           | bsv HDPrivateKey instance                       |                     |
| xPrivString     | HD Private key string                           | "xprv....."         |
| xPub            | bsv HD Public key instance                      |                     |
| xPubString      | HD Public key string                            | "xpub....."         |
| accessKeyString | Hex private part of an access key               | string              |
| signRequest     | Whether to sign all requests sent to the server | boolean             |
| debug           | Whether to turn debugging on                    | boolean             |

## Connection as a Bux admin

You can add the admin key to the Bux client after initialisation to support admin requests (registering an xPub).

```javascript
const adminKey = 'xprv.....';
buxClient.SetAdminKey(adminKey);
```

# Quick Guide how to run examples

In this directory you can find examples of how to use the `spv-wallet-js-client` package.

## Before you run

### Pre-requisites

- You have access to the `spv-wallet` non-custodial wallet (running locally or remotely).
- You have installed this package on your machine (`yarn install` on this project's root directory).

### Concerning the keys

- The `adminKey` defined in `example-keys.ts` is the default one from [spv-wallet-web-backend repository](https://github.com/bitcoin-sv/spv-wallet-web-backend/blob/main/config/viper.go#L56)
  - If in your current `spv-wallet` instance you have a different `adminKey`, you should replace the one in `example-keys` with the one you have.
- The `exampleXPub` and `exampleXPriv` are just placeholders, which won't work.
  - You should replace them by newly generated ones using `yarn generate-keys`,
  - ... or use your actual keys if you have them (don't use the keys which are already added to another wallet).

> Additionally, to make it work properly, you should adjust the `examplePaymail` to align with your `domains` configuration in the `spv-wallet` instance.

## Proposed order of executing examples

1. `generate-keys` - generates new keys (you can copy them to `example-keys` if you want to use them in next examples)
2. `admin-add-user` - adds a new user (more precisely adds `exampleXPub` and then `examplePaymail` to the wallet)

> To fully experience the next steps, it would be beneficial to transfer some funds to your `examplePaymail`. This ensures the examples run smoothly by demonstrating the creation of a transaction with an actual balance. You can transfer funds to your `examplePaymail` using a Bitcoin SV wallet application such as HandCash or any other that supports Paymail.

3. `get-balance` - checks the balance - if you've transferred funds to your `examplePaymail`, you should see them here
4. `create-transaction` - creates a transaction (you can adjust the `outputs` to your needs)
5. `list-transactions` - lists all transactions and with example filtering
6. `send-op-return` - sends an OP_RETURN transaction
7. `admin-remove-user` - removes the user
8. `admin-webhooks` - shows how to set up webhooks and how to handle them

In addition to the above, there are additional examples showing how to use the client from a developer perspective:

- `handle-exceptions` - presents how to "catch" exceptions which the client can throw
- `custom-logger` - shows different ways you can configure (or disable) internal logger

## Util examples

1. `xpriv-from-mnemonic` - allows you to generate/extract an xPriv key from a mnemonic phrase. To you use it you just need to replace the `mnemonic` variable with your own mnemonic phrase.
2. `xpub-from-xpriv` - allows you to generate an xPub key from an xPriv key. To you use it you just need to replace the `xPriv` variable with your own xPriv key.
3. `generate-totp` - allows you to generate and check validity of a TOTP code for client xPriv and a contact's PKI

## Webhook example and Use Cases

The [webhook.ts](./webhook.ts) example demonstrates how to set up a webhook notifier with the spv-wallet-js-client library, utilizing Fastify as the server to handle incoming webhook events. This setup allows developers to handle real-time updates from the spv-wallet system, such as transaction notifications, status updates, and custom events. The example is designed to be adaptable; any server framework can be substituted to handle these notifications, as it follows a flexible handler interface.

#### Registering Event Handlers

In this setup, we can register handlers only for specific event types, and these events mirror those defined in the `spv-wallet`.
To add a new event type for handling, it must first be implemented in `spv-wallet`, then mapped within the [`Events`](../src/types.ts) object in this client. This setup ensures that event handling in the client is synchronized with available events from the `spv-wallet`.

#### Example Use Cases

1. `Transaction Updates`: Automatically receive and process updates when transactions are sent or received by a wallet, such as logging or alerting users.
2. `Custom Event Processing`: Customize and extend handling for specific events (e.g., StringEvent or TransactionEvent) to perform actions like updating a database or notifying other systems.
3. `Automated User Management`: Using webhooks, you can manage user accounts, detect suspicious activity, or trigger alerts based on predefined conditions in real time.

To run this example, ensure you have spv-wallet configured and running to receive webhook events at the specified Fastify server endpoint.

## How to run an example

The examples are written in TypeScript and can be run by:

```bash
cd examples
yarn name-of-the-example
```

> See the `package.json` for the list of available examples and scripts

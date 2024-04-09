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
6. `admin-remove-user` - removes the user

## How to run an example

The examples are written in TypeScript and can be run by:

```bash
cd examples
yarn name-of-the-example
```

> See the `package.json` for the list of available examples and scripts

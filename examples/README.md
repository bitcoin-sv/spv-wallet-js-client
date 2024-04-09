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
  - ... or use your actual keys if you have them (in this case please skip the examples that add or remove keys).

> Additionally, to make it work properly, you should adjust the `examplePaymail` to align with your `domains` configuration in the `spv-wallet` instance.

## Proposed order of executing examples

1. `generate-keys` - generates new keys (you can copy them to `example-keys` if you want to use them in next examples)
2. `admin-add-user` - adds a new user (more precisely adds `exampleXPub` and then `examplePaymail` to the wallet)

> Before proceeding to the next step (`create-transaction`), it's necessary to ensure that your `examplePaymail` has sufficient funds. You can transfer funds to your `examplePaymail` using a Bitcoin SV wallet application such as HandCash or any other that supports Paymail.

3. `create-transaction` - creates a transaction (you can adjust the `outputs` to your needs)
4. `list-transactions` - lists all transactions and with example filtering
5. `admin-remove-user` - removes the user

## How to run an example

The examples are written in TypeScript and can be run by:

```bash
cd examples
yarn name-of-the-example
```

> See the `package.json` for the list of available examples and scripts

# Quick guide how to run examples

In this directory you can find examples of how to use the `spv-wallet` package.

## Before you run the examples

### Pre-requisites

- You have access to the `spv-wallet` non-custodial wallet (running locally or remotely)
- You have installed this package on your machine (`yarn install` on this project's root directory)

### Concerning the keys

- The `adminKey` defined in `example-keys` is the default one from [spv-wallet-web-backend repository](https://github.com/bitcoin-sv/spv-wallet-web-backend/blob/main/config/viper.go#L56)
  - If in your current spv-wallet instance you have a different `adminKey`, you should replace the one in `example-keys` with the one you have
- The `exampleXPub` and `exampleXPriv` are just examples, which regenerate every time you run an example
  - You can replace them by newly generated ones using `generate-keys` script
  - ... or use your actual keys if you have them (in this case please skip the examples that add or remove keys)

> Additionally you should adjust the `examplePaymail` to align with your `domains` configuration in the `spv-wallet` instance.

## Poposed order of executing examples

1. `generate-keys` - generates new keys (you can copy them to `example-keys` if you want to use them in next examples)
1. `admin-add-user` - adds a new user (more precisely adds `exampleXPub` and then `examplePaymail` to the wallet)
   > at this point you should transfer some funds to the `examplePaymail` paymail (e.g via HandCash)
1. `create-transaction` - creates a transaction (you can adjust the `outputs` to your needs)
1. `list-transactions` - lists all transactions and with example filtering
1. `admin-remove-user` - removes the user

## How to run an example

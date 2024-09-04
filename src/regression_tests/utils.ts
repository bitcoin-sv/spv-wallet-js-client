import { SpvWalletClient } from '../client';
import { generateKeys } from '../utils/keys';
import { TransactionFilter } from '../filters';
import { QueryParams, Recipients, Tx, Txs } from '../types';

const CLIENT_ONE_URL_ENV_VAR = 'CLIENT_ONE_URL';
const CLIENT_TWO_URL_ENV_VAR = 'CLIENT_TWO_URL';
const CLIENT_ONE_LEADER_XPRIV_ENV_VAR = 'CLIENT_ONE_LEADER_XPRIV';
const CLIENT_TWO_LEADER_XPRIV_ENV_VAR = 'CLIENT_TWO_LEADER_XPRIV';
const AT_SIGN = '@';
const DOMAIN_PREFIX = 'https://';
const API_VERSION = 'v1';
const ERR_EMPTY_XPRIV_ENV_VARIABLES = 'missing xpriv variables';
const EXPLICIT_HTTP_URL_REGEX = RegExp('^https?://');

export interface RegressionTestUser {
  xpriv: string;
  xpub: string;
  paymail: string;
}

export interface RegressionTestConfig {
  clientOneURL: string;
  clientTwoURL: string;
  clientOneLeaderXPriv: string;
  clientTwoLeaderXPriv: string;
}

// getEnvVariables retrieves the environment variables needed for the regression tests.
export const getEnvVariables = function (): RegressionTestConfig {
  const rtConfig: RegressionTestConfig = {
    clientOneURL: process.env[CLIENT_ONE_URL_ENV_VAR] || '',
    clientTwoURL: process.env[CLIENT_TWO_URL_ENV_VAR] || '',
    clientOneLeaderXPriv: process.env[CLIENT_ONE_LEADER_XPRIV_ENV_VAR] || '',
    clientTwoLeaderXPriv: process.env[CLIENT_TWO_LEADER_XPRIV_ENV_VAR] || '',
  };

  if (rtConfig.clientOneLeaderXPriv === '' || rtConfig.clientTwoLeaderXPriv === '') {
    throw new Error(ERR_EMPTY_XPRIV_ENV_VARIABLES);
  }

  if (rtConfig.clientOneURL === '' || rtConfig.clientTwoURL === '') {
    rtConfig.clientOneURL = 'http://localhost:3003/v1';
    rtConfig.clientTwoURL = 'http://localhost:3003/v1';
  }

  rtConfig.clientOneURL = addPrefixIfNeeded(rtConfig.clientOneURL);
  rtConfig.clientTwoURL = addPrefixIfNeeded(rtConfig.clientTwoURL);

  rtConfig.clientOneURL = addApiVersionIfNeeded(rtConfig.clientOneURL, API_VERSION);
  rtConfig.clientTwoURL = addApiVersionIfNeeded(rtConfig.clientTwoURL, API_VERSION);

  return rtConfig;
};

// getPaymailDomain retrieves the shared configuration from the SPV Wallet.
export const getPaymailDomain = async function (xpriv: string, clientUrl: string): Promise<string> {
  const wc = new SpvWalletClient(clientUrl, {
    xPriv: xpriv,
  });

  const sharedConfig = await wc.GetSharedConfig();

  if (sharedConfig.paymail_domains.length != 1) {
    throw new Error(`expected 1 paymail domain, got ${sharedConfig.paymail_domains.length}`);
  }

  return sharedConfig.paymail_domains[0];
};

// createUser creates a set of keys and new paymail in the SPV wallet
export const createUser = async function (
  paymail: string,
  paymailDomain: string,
  instanceUrl: string,
  adminXPriv: string,
): Promise<RegressionTestUser> {
  const keys = generateKeys();

  const user: RegressionTestUser = {
    xpriv: keys.xPriv(),
    xpub: keys.xPub.toString(),
    paymail: preparePaymail(paymail, paymailDomain),
  };

  const adminClient = new SpvWalletClient(instanceUrl, {
    adminKey: adminXPriv,
  });

  await adminClient.AdminNewXpub(user.xpub, { some_metadata: 'remove' });
  await adminClient.AdminCreatePaymail(user.xpub, user.paymail, 'Regression tests', '');

  return user;
};

// removeRegisteredPaymail soft deletes paymail from the SPV Wallet.
export const removeRegisteredPaymail = async function (
  paymail: string,
  instanceURL: string,
  adminXPriv: string,
): Promise<void> {
  const adminClient = new SpvWalletClient(instanceURL, { adminKey: adminXPriv, xPriv: adminXPriv });
  await adminClient.AdminDeletePaymail(paymail);
};

// getBalance retrieves the balance from the SPV Wallet.
export const getBalance = async function (fromInstance: string, fromXPriv: string): Promise<number> {
  const client = new SpvWalletClient(fromInstance, { xPriv: fromXPriv });

  const xpubInfo = await client.GetXPub();

  return Number(xpubInfo.current_balance);
};

// getTransactions retrieves the transactions from the SPV Wallet.
export const getTransactions = async function (fromInstance: string, fromXPriv: string): Promise<Txs> {
  const client = new SpvWalletClient(fromInstance, { xPriv: fromXPriv });

  const metadata = new Map<string, any>();
  const conditions: TransactionFilter = {};
  const queryParams: QueryParams = {};

  const txs = await client.GetTransactions(conditions, metadata, queryParams);

  return txs;
};

// sendFunds sends funds from one paymail to another
export const sendFunds = async function (
  fromInstance: string,
  fromXPriv: string,
  toPaymail: string,
  howMuch: number,
): Promise<Tx> {
  const client = new SpvWalletClient(fromInstance, { xPriv: fromXPriv });

  const balance = await getBalance(fromInstance, fromXPriv);
  if (balance < howMuch) {
    throw new Error(`Insufficient funds: ${balance}`);
  }

  const recipients: Recipients = [{ to: toPaymail, satoshis: howMuch }];
  const metadata = { description: 'regression-test' };

  const transaction = await client.SendToRecipients(recipients, metadata);

  const tx = await client.GetTransaction(transaction.id);

  return tx;
};

// preparePaymail prepares the paymail address by combining the alias and domain.
export const preparePaymail = function (paymailAlias: string, domain: string): string {
  if (isValidURL(domain)) {
    const splitedDomain = domain.split('//');
    domain = splitedDomain[1];
  }
  const url = paymailAlias + AT_SIGN + domain;
  return url;
};

// addPrefixIfNeeded adds the HTTPS prefix to the URL if it is missing.
export const addPrefixIfNeeded = function (url: string): string {
  if (!isValidURL(url)) {
    return DOMAIN_PREFIX + url;
  }
  return url;
};

// isValidURL validates the URL if it has http or https prefix.
export const isValidURL = function (rawURL: string): boolean {
  return EXPLICIT_HTTP_URL_REGEX.test(rawURL);
};

// addApiVersionIfNeeded adds api version if it's not present in the url
const addApiVersionIfNeeded = function (url: string, apiVersion: string): string {
  const apiVersionWithSlash = '/' + apiVersion;
  if (url.includes(apiVersionWithSlash)) {
    return url;
  }

  return url.endsWith('/') ? url + apiVersion : url + apiVersionWithSlash;
};

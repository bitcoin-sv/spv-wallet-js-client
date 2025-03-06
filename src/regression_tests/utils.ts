import { SPVWalletAdminAPI } from '../admin-api';
import { SPVWalletUserAPI } from '../user-api';
import { generateKeys } from '../utils/keys';
import { TransactionFilter } from '../filters';
import { QueryPageParams } from '../types';

const CLIENT_SL_URL_ENV_VAR = 'CLIENT_ONE_URL';
const CLIENT_PG_URL_ENV_VAR = 'CLIENT_TWO_URL';
const CLIENT_SL_LEADER_XPRIV_ENV_VAR = 'CLIENT_ONE_LEADER_XPRIV';
const CLIENT_PG_LEADER_XPRIV_ENV_VAR = 'CLIENT_TWO_LEADER_XPRIV';
const AT_SIGN = '@';
const DOMAIN_PREFIX = 'https://';
const ERR_EMPTY_XPRIV_ENV_VARIABLES = 'missing xpriv variables';
const EXPLICIT_HTTP_URL_REGEX = RegExp('^https?://');
const TOTP_DIGITS = 4;
const TOTP_PERIOD = 1200;

export interface RegressionTestUser {
  xpriv: string;
  xpub: string;
  paymail: string;
  paymailId: string;
}

export interface RegressionTestConfig {
  slClientURL: string;
  pgClientURL: string;
  slClientLeaderXPriv: string;
  pgClientLeaderXPriv: string;
}

// getEnvVariables retrieves the environment variables needed for the regression tests.
export const getEnvVariables = () => {
  const rtConfig: RegressionTestConfig = {
    slClientURL: process.env[CLIENT_SL_URL_ENV_VAR] || '',
    pgClientURL: process.env[CLIENT_PG_URL_ENV_VAR] || '',
    slClientLeaderXPriv: process.env[CLIENT_SL_LEADER_XPRIV_ENV_VAR] || '',
    pgClientLeaderXPriv: process.env[CLIENT_PG_LEADER_XPRIV_ENV_VAR] || '',
  };

  if (rtConfig.slClientLeaderXPriv === '' || rtConfig.pgClientLeaderXPriv === '') {
    throw new Error(ERR_EMPTY_XPRIV_ENV_VARIABLES);
  }

  if (rtConfig.slClientURL === '' || rtConfig.pgClientURL === '') {
    rtConfig.slClientURL = 'http://localhost:3003/api/v1';
    rtConfig.pgClientURL = 'http://localhost:3003/api/v1';
  }

  rtConfig.slClientURL = addPrefixIfNeeded(rtConfig.slClientURL);
  rtConfig.pgClientURL = addPrefixIfNeeded(rtConfig.pgClientURL);

  return rtConfig;
};

// getPaymailDomain retrieves the shared configuration from the SPV Wallet.
export const getPaymailDomain = async (wc: SPVWalletUserAPI) => {
  const sharedConfig = await wc.sharedConfig();

  if (sharedConfig.paymailDomains.length != 1) {
    throw new Error(`expected 1 paymail domain, got ${sharedConfig.paymailDomains.length}`);
  }

  return sharedConfig.paymailDomains[0];
};

// createUserClient creates a new SPV Wallet user client.
export const createUserClient = (instanceUrl: string, xPriv: string): SPVWalletUserAPI => {
  return new SPVWalletUserAPI(instanceUrl, { xPriv });
};

// createAdminClient creates a new SPV Wallet admin client.
export const createAdminClient = (instanceUrl: string, adminXPriv: string): SPVWalletAdminAPI => {
  return new SPVWalletAdminAPI(instanceUrl, { adminKey: adminXPriv });
};

export const createUserClientWithAccessKey = (instanceUrl: string, accessKey: string) => {
  return new SPVWalletUserAPI(instanceUrl, { accessKey: accessKey });
}

// createUser creates a set of keys and new paymail in the SPV wallet
export const createUser = async (alias: string, paymailDomain: string, instanceUrl: string, adminXPriv: string) => {
  const keys = generateKeys();
  const user: RegressionTestUser = {
    xpriv: keys.xPriv(),
    xpub: keys.xPub.toString(),
    paymail: preparePaymail(alias, paymailDomain),
    paymailId: '',
  };

  const adminClient = new SPVWalletAdminAPI(instanceUrl, { adminKey: adminXPriv });

  await adminClient.createXPub(user.xpub, { some_metadata: 'remove' });
  const paymailAddress = await adminClient.createPaymail(user.xpub, user.paymail, 'Regression tests', '', {});
  user.paymailId = paymailAddress.id;

  return user;
};

// removeRegisteredPaymail soft deletes paymail from the SPV Wallet.
export const removeRegisteredPaymail = async (adminClient: SPVWalletAdminAPI, paymailId: string) => {
  await adminClient.deletePaymail(paymailId);
};

// getBalance retrieves the balance from the SPV Wallet.
export const getBalance = async (client: SPVWalletUserAPI) => {
  const xpubInfo = await client.xPub();

  return Number(xpubInfo.currentBalance);
};

// getTransactions retrieves the transactions from the SPV Wallet.
export const getTransactions = async (client: SPVWalletUserAPI) => {
  const metadata = new Map<string, any>();
  const conditions: TransactionFilter = {};
  const queryParams: QueryPageParams = {};

  const txs = await client.transactions(conditions, metadata, queryParams);

  return txs;
};

// sendFunds sends funds from one paymail to another
export const sendFunds = async (client: SPVWalletUserAPI, toPaymail: string, howMuch: number) => {
  const balance = await getBalance(client);
  if (balance < howMuch) {
    throw new Error(`Insufficient funds: ${balance}`);
  }

  const recipients = [{ to: toPaymail, satoshis: howMuch }];
  const metadata = { description: 'regression-test' };

  const transaction = await client.sendToRecipients(
    {
      outputs: recipients,
    },
    metadata,
  );

  const tx = await client.transaction(transaction.id);

  return tx;
};

// preparePaymail prepares the paymail address by combining the alias and domain.
const preparePaymail = (paymailAlias: string, domain: string) => {
  if (isValidURL(domain)) {
    const splitedDomain = domain.split('//');
    domain = splitedDomain[1];
  }
  const url = paymailAlias + AT_SIGN + domain;
  return url.toLowerCase();
};

// addPrefixIfNeeded adds the HTTPS prefix to the URL if it is missing.
const addPrefixIfNeeded = (url: string) => {
  if (!isValidURL(url)) {
    return DOMAIN_PREFIX + url;
  }
  return url;
};

// isValidURL validates the URL if it has http or https prefix.
const isValidURL = (rawURL: string) => {
  return EXPLICIT_HTTP_URL_REGEX.test(rawURL);
};

export const sendAndVerifyFunds = async (
  fromClient: SPVWalletUserAPI,
  targetClient: SPVWalletUserAPI,
  toPaymail: string,
  howMuch: number,
) => {
  const transaction = await sendFunds(fromClient, toPaymail, howMuch);
  expect(transaction.outputValue).toBeLessThanOrEqual(-1);

  const balance = await getBalance(targetClient);
  expect(balance).toBeGreaterThanOrEqual(1);

  const { content: transactions } = await getTransactions(targetClient);
  expect(transactions.length).toBeGreaterThanOrEqual(1);
};

import { SpvWalletClient } from '../client';
import { generateKeys } from '../utils/keys';
import { TransactionFilter } from '../filters';
import { QueryParams } from '../types';

const CLIENT_ONE_URL_ENV_VAR = 'CLIENT_ONE_URL';
const CLIENT_TWO_URL_ENV_VAR = 'CLIENT_TWO_URL';
const CLIENT_ONE_LEADER_XPRIV_ENV_VAR = 'CLIENT_ONE_LEADER_XPRIV';
const CLIENT_TWO_LEADER_XPRIV_ENV_VAR = 'CLIENT_TWO_LEADER_XPRIV';
const AT_SIGN = '@';
const DOMAIN_PREFIX = 'https://';
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
export const getEnvVariables = () => {
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

  return rtConfig;
};

// getPaymailDomain retrieves the shared configuration from the SPV Wallet.
export const getPaymailDomain = async (xpriv: string, clientUrl: string) => {
  const wc = new SpvWalletClient(clientUrl, {
    xPriv: xpriv,
  });

  const sharedConfig = await wc.GetSharedConfig();
  console.log(sharedConfig);

  if (sharedConfig.paymailDomains.length != 1) {
    throw new Error(`expected 1 paymail domain, got ${sharedConfig.paymailDomains.length}`);
  }

  return sharedConfig.paymailDomains[0];
};

// createUser creates a set of keys and new paymail in the SPV wallet
export const createUser = async (paymail: string, paymailDomain: string, instanceUrl: string, adminXPriv: string) => {
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
export const removeRegisteredPaymail = async (paymail: string, instanceURL: string, adminXPriv: string) => {
  const adminClient = new SpvWalletClient(instanceURL, { adminKey: adminXPriv, xPriv: adminXPriv });
  await adminClient.AdminDeletePaymail(paymail);
};

// getBalance retrieves the balance from the SPV Wallet.
export const getBalance = async (fromInstance: string, fromXPriv: string) => {
  const client = new SpvWalletClient(fromInstance, { xPriv: fromXPriv });

  const xpubInfo = await client.GetUserInfo();

  return Number(xpubInfo.currentBalance);
};

// getTransactions retrieves the transactions from the SPV Wallet.
export const getTransactions = async (fromInstance: string, fromXPriv: string) => {
  const client = new SpvWalletClient(fromInstance, { xPriv: fromXPriv });

  const metadata = new Map<string, any>();
  const conditions: TransactionFilter = {};
  const queryParams: QueryParams = {};

  const txs = await client.GetTransactions(conditions, metadata, queryParams);

  return txs;
};

// sendFunds sends funds from one paymail to another
export const sendFunds = async (fromInstance: string, fromXPriv: string, toPaymail: string, howMuch: number) => {
  const client = new SpvWalletClient(fromInstance, { xPriv: fromXPriv });

  const balance = await getBalance(fromInstance, fromXPriv);
  if (balance < howMuch) {
    throw new Error(`Insufficient funds: ${balance}`);
  }

  const recipients = [{ to: toPaymail, satoshis: howMuch }];
  const metadata = { description: 'regression-test' };

  const transaction = await client.SendToRecipients(
    {
      outputs: recipients,
    },
    metadata,
  );

  const tx = await client.GetTransactions({ id: transaction.id }, {}, {});

  return tx;
};

// preparePaymail prepares the paymail address by combining the alias and domain.
const preparePaymail = (paymailAlias: string, domain: string) => {
  if (isValidURL(domain)) {
    const splitedDomain = domain.split('//');
    domain = splitedDomain[1];
  }
  const url = paymailAlias + AT_SIGN + domain;
  return url;
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

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
export const getPaymailDomain = async (xpriv: string, clientUrl: string) => {
  const wc = new SPVWalletUserAPI(clientUrl, {
    xPriv: xpriv,
  });

  const sharedConfig = await wc.sharedConfig();

  if (sharedConfig.paymailDomains.length != 1) {
    throw new Error(`expected 1 paymail domain, got ${sharedConfig.paymailDomains.length}`);
  }

  return sharedConfig.paymailDomains[0];
};

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
export const removeRegisteredPaymail = async (paymailId: string, instanceURL: string, adminXPriv: string) => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  await adminClient.deletePaymail(paymailId);
};

// getBalance retrieves the balance from the SPV Wallet.
export const getBalance = async (fromInstance: string, fromXPriv: string) => {
  const client = new SPVWalletUserAPI(fromInstance, { xPriv: fromXPriv });

  const xpubInfo = await client.xPub();

  return Number(xpubInfo.currentBalance);
};

// getTransactions retrieves the transactions from the SPV Wallet.
export const getTransactions = async (fromInstance: string, fromXPriv: string) => {
  const client = new SPVWalletUserAPI(fromInstance, { xPriv: fromXPriv });

  const metadata = new Map<string, any>();
  const conditions: TransactionFilter = {};
  const queryParams: QueryPageParams = {};

  const txs = await client.transactions(conditions, metadata, queryParams);

  return txs;
};

// sendFunds sends funds from one paymail to another
export const sendFunds = async (fromInstance: string, fromXPriv: string, toPaymail: string, howMuch: number) => {
  const client = new SPVWalletUserAPI(fromInstance, { xPriv: fromXPriv });

  const balance = await getBalance(fromInstance, fromXPriv);
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

// Add a contact for a user
export const addContact = async (
  instanceUrl: string,
  xPriv: string,
  contactPaymail: string,
  contactName: string,
  requesterPaymail: string
) => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv: xPriv });
  return await client.upsertContact(contactPaymail, contactName, requesterPaymail, {});
};

// Get a contact by paymail
export const getContact = async (instanceUrl: string, xPriv: string, contactPaymail: string) => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv: xPriv });
  return await client.contactWithPaymail(contactPaymail);
};

// Get all contacts matching a paymail using the `contacts()` method
export const getContacts = async (instanceUrl: string, xPriv: string, contactPaymail: string) => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  const conditions = { paymail: contactPaymail };
  const metadata = {};
  const queryParams = {};

  const contactList = await client.contacts(conditions, metadata, queryParams);
  return contactList?.content ? contactList.content : [];
};

// confirm a contact
export const confirmContact = async (
  instanceUrl: string,
  xPriv: string,
  requesterPaymail: string,
  contactToConfirm: string,
  receivedTotp: string
) => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  const contact = await client.contactWithPaymail(contactToConfirm);
  if (!contact) {
    throw new Error(`Contact ${contactToConfirm} not found!`);
  }
  await client.confirmContact(contact, receivedTotp, requesterPaymail, TOTP_PERIOD, TOTP_DIGITS);
};

// Unconfirm a contact
export const unconfirmContact = async (
  instanceUrl: string,
  xPriv: string,
  contactPaymail: string
) => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  await client.unconfirmContact(contactPaymail);
};

// Remove a contact
export const removeContact = async (instanceUrl: string, xPriv: string, contactPaymail: string) => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv: xPriv });
  await client.removeContact(contactPaymail);
};

// Generate a TOTP for a contact
export const generateTotp = async (
  instanceUrl: string,
  xPriv: string,
  contactPaymail: string
) => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  const contact = await client.contactWithPaymail(contactPaymail);
  if (!contact) {
    throw new Error(`Contact ${contactPaymail} not found!`);
  }
  return client.generateTotpForContact(contact, TOTP_PERIOD, TOTP_DIGITS);
};

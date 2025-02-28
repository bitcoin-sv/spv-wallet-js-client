import { SPVWalletUserAPI } from '../user-api';
import { Contact } from '../types';

const TOTP_DIGITS = 4;
const TOTP_PERIOD = 1200;

/**
 * Adds a contact for a user.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @param {string} contactPaymail - The paymail address of the contact.
 * @param {string} contactName - The name of the contact.
 * @param {string} requesterPaymail - The paymail of the requester.
 * @returns {Promise<void>}
 */
export const addContact = async (
  instanceUrl: string,
  xPriv: string,
  contactPaymail: string,
  contactName: string,
  requesterPaymail: string
): Promise<Contact> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  return await client.upsertContact(contactPaymail, contactName, requesterPaymail, {});
};

/**
 * Retrieves a contact by paymail.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @param {string} contactPaymail - The paymail address of the contact.
 * @returns {Promise<Contact>} - The contact details.
 */
export const getContact = async (instanceUrl: string, xPriv: string, contactPaymail: string): Promise<any> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  return await client.contactWithPaymail(contactPaymail);
};

/**
 * Retrieves all contacts matching a paymail.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @param {string} contactPaymail - The paymail address of the contact.
 * @returns {Promise<Contact[]>} - A list of matching contacts.
 */
export const getContacts = async (instanceUrl: string, xPriv: string, contactPaymail: string): Promise<any[]> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  const conditions = { paymail: contactPaymail };
  const metadata = {};
  const queryParams = {};

  const contactList = await client.contacts(conditions, metadata, queryParams);
  return contactList?.content ? contactList.content : [];
};

/**
 * Confirms a contact connection.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @param {string} requesterPaymail - The paymail of the requester.
 * @param {string} contactToConfirm - The paymail of the contact to confirm.
 * @param {string} receivedTotp - The TOTP code for verification.
 * @returns {Promise<void>}
 */
export const confirmContact = async (
  instanceUrl: string,
  xPriv: string,
  requesterPaymail: string,
  contactToConfirm: string,
  receivedTotp: string
): Promise<void> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  const contact = await client.contactWithPaymail(contactToConfirm);
  if (!contact) {
    throw new Error(`Contact ${contactToConfirm} not found!`);
  }
  await client.confirmContact(contact, receivedTotp, requesterPaymail, TOTP_PERIOD, TOTP_DIGITS);
};

/**
 * Unconfirms a contact connection.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @param {string} contactPaymail - The paymail address of the contact to unconfirm.
 * @returns {Promise<void>}
 */
export const unconfirmContact = async (
  instanceUrl: string,
  xPriv: string,
  contactPaymail: string
): Promise<void> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  await client.unconfirmContact(contactPaymail);
};

/**
 * Removes a contact from the SPV Wallet.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @param {string} contactPaymail - The paymail address of the contact to remove.
 * @returns {Promise<void>}
 */
export const removeContact = async (instanceUrl: string, xPriv: string, contactPaymail: string): Promise<void> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  await client.removeContact(contactPaymail);
};

/**
 * Generates a TOTP for a contact.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @param {string} contactPaymail - The paymail address of the contact.
 * @returns {Promise<string>} - The generated TOTP.
 */
export const generateTotp = async (
  instanceUrl: string,
  xPriv: string,
  contactPaymail: string
): Promise<string> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  const contact = await client.contactWithPaymail(contactPaymail);
  if (!contact) {
    throw new Error(`Contact ${contactPaymail} not found!`);
  }
  return client.generateTotpForContact(contact, TOTP_PERIOD, TOTP_DIGITS);
};

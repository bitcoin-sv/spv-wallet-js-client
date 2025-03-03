import { SPVWalletAdminAPI } from '../admin-api';
import { NewContact, Contact } from '../types';

/**
 * Fetches all contacts from the SPV Wallet based on filters.
 *
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @returns {Promise<Contact[]>} - List of contacts.
 */
export const getContacts = async (
  instanceURL: string,
  adminXPriv: string
): Promise<Contact[]> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  const contactsPage = await adminClient.contacts({}, {}, {});
  return contactsPage.content;
};

/**
 * Updates contact information in the SPV Wallet.
 *
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @param {string} contactId - Contact ID.
 * @param {string} fullName - New full name for the contact.
 * @returns {Promise<Contact>} - The updated contact.
 */
export const updateContact = async (
  instanceURL: string,
  adminXPriv: string,
  contactId: string,
  fullName: string
): Promise<Contact> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  return await adminClient.contactUpdate(contactId, fullName, {});
};

/**
 * Deletes a contact from the SPV Wallet.
 *
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @param {string} contactId - ID of the contact to delete.
 * @returns {Promise<void>}
 */
export const deleteContact = async (
  instanceURL: string,
  adminXPriv: string,
  contactId: string
): Promise<void> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  await adminClient.deleteContact(contactId);
};

/**
 * Accepts a contact invitation.
 *
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @param {string} invitationId - ID of the invitation to accept.
 * @returns {Promise<Contact>} - The accepted contact.
 */
export const acceptContactInvitation = async (
  instanceURL: string,
  adminXPriv: string,
  invitationId: string
): Promise<Contact> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  return await adminClient.acceptInvitation(invitationId);
};

/**
 * Rejects a contact invitation.
 *
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @param {string} invitationId - ID of the invitation to reject.
 * @returns {Promise<void>}
 */
export const rejectContactInvitation = async (
  instanceURL: string,
  adminXPriv: string,
  invitationId: string
): Promise<void> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  await adminClient.rejectInvitation(invitationId);
};

/**
 * Creates a new contact in the SPV Wallet.
 *
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @param {string} contactPaymail - Paymail address for the new contact.
 * @param {NewContact} newContact - Contact information.
 * @returns {Promise<Contact>} - The created contact.
 */
export const createContact = async (
  instanceURL: string,
  adminXPriv: string,
  contactPaymail: string,
  newContact: NewContact
): Promise<Contact> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  return await adminClient.createContact(contactPaymail, newContact);
};

/**
 * Confirms a contact connection between two paymails.
 *
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @param {string} paymailA - First contact's paymail.
 * @param {string} paymailB - Second contact's paymail.
 * @returns {Promise<void>}
 */
export const confirmContacts = async (
  instanceURL: string,
  adminXPriv: string,
  paymailA: string,
  paymailB: string
): Promise<void> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  await adminClient.confirmContacts(paymailA, paymailB);
};

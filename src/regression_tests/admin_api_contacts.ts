import { SPVWalletAdminAPI } from '../admin-api';
import { NewContact, Contact } from '../types';

/**
 * Fetches all contacts from the SPV Wallet based on filters.
 *
 * @param {AdminContactFilter} conditions - Filter conditions for contacts.
 * @param {Metadata} metadata - Additional metadata filters.
 * @param {QueryPageParams} params - Pagination parameters.
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
 * @param {string} contactId - Contact ID.
 * @param {string} fullName - New full name for the contact.
 * @param {Metadata} metadata - Additional metadata.
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @returns {Promise<Contact>} - The updated contact.
 */
export const updateContact = async (
  contactId: string,
  fullName: string,
  instanceURL: string,
  adminXPriv: string
): Promise<Contact> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  return await adminClient.contactUpdate(contactId, fullName, {});
};

/**
 * Deletes a contact from the SPV Wallet.
 *
 * @param {string} contactId - ID of the contact to delete.
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @returns {Promise<void>}
 */
export const deleteContact = async (instanceURL: string, adminXPriv: string, contactId: string): Promise<void> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  await adminClient.deleteContact(contactId);
};

/**
 * Accepts a contact invitation.
 *
 * @param {string} invitationId - ID of the invitation to accept.
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @returns {Promise<Contact>} - The accepted contact.
 */
export const acceptContactInvitation = async (
  invitationId: string,
  instanceURL: string,
  adminXPriv: string
): Promise<Contact> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  return await adminClient.acceptInvitation(invitationId);
};

/**
 * Rejects a contact invitation.
 *
 * @param {string} invitationId - ID of the invitation to reject.
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @returns {Promise<void>}
 */
export const rejectContactInvitation = async (invitationId: string, instanceURL: string, adminXPriv: string): Promise<void> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  await adminClient.rejectInvitation(invitationId);
};

/**
 * Creates a new contact in the SPV Wallet.
 *
 * @param {string} contactPaymail - Paymail address for the new contact.
 * @param {NewContact} newContact - Contact information.
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
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
 * @param {string} paymailA - First contact's paymail.
 * @param {string} paymailB - Second contact's paymail.
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @returns {Promise<void>}
 */
export const confirmContact = async (
  instanceURL: string,
  adminXPriv: string,
  paymailA: string,
  paymailB: string
): Promise<void> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  await adminClient.confirmContacts(paymailA, paymailB);
};

/**
 * Unconfirms a contact connection.
 *
 * @param {string} contactId - ID of the contact to unconfirm.
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @returns {Promise<void>}
 */
export const unconfirmContact = async (
  instanceURL: string,
  adminXPriv: string,
  contactId: string
): Promise<void> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  await adminClient.unconfirmContact(contactId);
};

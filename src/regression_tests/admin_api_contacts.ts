import { SPVWalletAdminAPI } from '../admin-api';
import { NewContact, Contact } from '../types';

/**
 * Fetches all contacts from the SPV Wallet based on filters.
 *
 * @param {SPVWalletAdminAPI} adminClient - The admin API client.
 * @returns {Promise<Contact[]>} - List of contacts.
 */
export const getContacts = async (adminClient: SPVWalletAdminAPI): Promise<Contact[]> => {
  const contactsPage = await adminClient.contacts({}, {}, {});
  return contactsPage.content;
};

/**
 * Updates contact information in the SPV Wallet.
 *
 * @param {SPVWalletAdminAPI} adminClient - The admin API client.
 * @param {string} contactId - Contact ID.
 * @param {string} fullName - New full name for the contact.
 * @returns {Promise<Contact>} - The updated contact.
 */
export const updateContact = async (
  adminClient: SPVWalletAdminAPI,
  contactId: string,
  fullName: string
): Promise<Contact> => {
  return await adminClient.contactUpdate(contactId, fullName, {});
};

/**
 * Deletes a contact from the SPV Wallet.
 *
 * @param {SPVWalletAdminAPI} adminClient - The admin API client.
 * @param {string} contactId - ID of the contact to delete.
 * @returns {Promise<void>}
 */
export const deleteContact = async (
  adminClient: SPVWalletAdminAPI,
  contactId: string
): Promise<void> => {
  await adminClient.deleteContact(contactId);
};

/**
 * Creates a new contact in the SPV Wallet.
 *
 * @param {SPVWalletAdminAPI} adminClient - The admin API client.
 * @param {string} contactPaymail - Paymail address for the new contact.
 * @param {NewContact} newContact - Contact information.
 * @returns {Promise<Contact>} - The created contact.
 */
export const createContact = async (
  adminClient: SPVWalletAdminAPI,
  contactPaymail: string,
  newContact: NewContact
): Promise<Contact> => {
  return await adminClient.createContact(contactPaymail, newContact);
};

/**
 * Confirms a contact connection between two paymails.
 *
 * @param {SPVWalletAdminAPI} adminClient - The admin API client.
 * @param {string} paymailA - First contact's paymail.
 * @param {string} paymailB - Second contact's paymail.
 * @returns {Promise<void>}
 */
export const confirmContacts = async (
  adminClient: SPVWalletAdminAPI,
  paymailA: string,
  paymailB: string
): Promise<void> => {
  await adminClient.confirmContacts(paymailA, paymailB);
};

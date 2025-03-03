import { SPVWalletAdminAPI } from '../admin-api';
import { SPVWalletUserAPI } from '../user-api';
import { AccessKey, PageModel } from '../types';

/**
 * Fetches all access keys from the SPV Wallet based on filters.
 *
 * @param {string} instanceURL - The base URL of the SPV Wallet.
 * @param {string} adminXPriv - Admin private key.
 * @returns {Promise<AccessKey[]>} - List of access keys.
 */
export const getAccessKeysAdmin = async (
  instanceURL: string,
  adminXPriv: string,
): Promise<AccessKey[]> => {
  const adminClient = new SPVWalletAdminAPI(instanceURL, { adminKey: adminXPriv });
  const accessKeysPage: PageModel<AccessKey> = await adminClient.accessKeys({}, {}, {});
  return accessKeysPage.content;
};

/**
 * Fetches all access keys for the user from the SPV Wallet based on filters.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @returns {Promise<AccessKey[]>} - List of access keys.
 */
export const getAccessKeys = async (
  instanceUrl: string,
  xPriv: string,
): Promise<AccessKey[]> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  const accessKeysPage: PageModel<AccessKey> = await client.accessKeys({}, {});
  return accessKeysPage.content;
};

/**
 * Generates a new access key for the user.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @returns {Promise<AccessKey>} - The newly created access key.
 */
export const generateAccessKey = async (
  instanceUrl: string,
  xPriv: string,
): Promise<AccessKey> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  return await client.generateAccessKey({});
};

/**
 * Retrieves a specific access key by ID.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @param {string} accessKeyId - The ID of the access key to retrieve.
 * @returns {Promise<AccessKey>} - Access key details.
 */
export const getAccessKeyById = async (
  instanceUrl: string,
  xPriv: string,
  accessKeyId: string
): Promise<AccessKey> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  return await client.accessKey(accessKeyId);
};

/**
 * Revokes an access key.
 *
 * @param {string} instanceUrl - The base URL of the SPV Wallet.
 * @param {string} xPriv - The user's private key.
 * @param {string} accessKeyId - The ID of the access key to revoke.
 * @returns {Promise<void>}
 */
export const revokeAccessKey = async (
  instanceUrl: string,
  xPriv: string,
  accessKeyId: string
): Promise<void> => {
  const client = new SPVWalletUserAPI(instanceUrl, { xPriv });
  await client.revokeAccessKey(accessKeyId);
};



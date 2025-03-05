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
  adminClient: SPVWalletAdminAPI
): Promise<AccessKey[]> => {
  const accessKeysPage: PageModel<AccessKey> = await adminClient.accessKeys({}, {}, {});
  return accessKeysPage.content;
};

/**
 * Fetches all access keys for the user.
 *
 * @param {SPVWalletUserAPI} client - The user API client.
 * @returns {Promise<AccessKey[]>} - List of access keys.
 */
export const getAccessKeys = async (client: SPVWalletUserAPI): Promise<AccessKey[]> => {
    const accessKeysPage: PageModel<AccessKey> = await client.accessKeys({}, {});
    return accessKeysPage.content;
  };

  /**
   * Generates a new access key for the user.
   *
   * @param {SPVWalletUserAPI} client - The user API client.
   * @returns {Promise<AccessKey>} - The newly created access key.
   */
  export const generateAccessKey = async (client: SPVWalletUserAPI): Promise<AccessKey> => {
    return await client.generateAccessKey({});
  };

  /**
   * Retrieves a specific access key by ID.
   *
   * @param {SPVWalletUserAPI} client - The user API client.
   * @param {string} accessKeyId - The ID of the access key to retrieve.
   * @returns {Promise<AccessKey>} - Access key details.
   */
  export const getAccessKeyById = async (
    client: SPVWalletUserAPI,
    accessKeyId: string
  ): Promise<AccessKey> => {
    return await client.accessKey(accessKeyId);
  };

  /**
   * Revokes an access key.
   *
   * @param {SPVWalletUserAPI} client - The user API client.
   * @param {string} accessKeyId - The ID of the access key to revoke.
   * @returns {Promise<void>}
   */
  export const revokeAccessKey = async (
    client: SPVWalletUserAPI,
    accessKeyId: string
  ): Promise<void> => {
    await client.revokeAccessKey(accessKeyId);
  };



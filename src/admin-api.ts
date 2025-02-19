import {
  AccessKey,
  AdminStats,
  AdminTx,
  Contact,
  NewContact,
  PaymailAddress,
  SharedConfig,
  Utxo,
  XPub,
  PageModel,
  Webhook,
  Metadata,
  QueryPageParams,
  AdminClientOptions,
} from './types';

import {
  AdminAccessKeyFilter,
  AdminContactFilter,
  AdminPaymailFilter,
  AdminUtxoFilter,
  TransactionFilter,
  XpubFilter,
} from './filters';

import { defaultLogger, Logger, LoggerConfig, makeLogger } from './logger';
import { HttpClient } from './httpclient';
import { buildQueryPath } from './query/query-builder';
import { ErrorInvalidAdminClientOptions } from './errors';

/**
 * SPVWalletAdminAPI class for handling administrative operations
 *
 * @class SPVWalletAdminAPI
 */
export class SPVWalletAdminAPI {
  logger: Logger;
  http: HttpClient;

  /**
   * Creates a new instance of SPVWalletAdminAPI
   *
   * @param {string} serverUrl - The base URL of the SPV Wallet server
   * @param {AdminClientOptions} options - Configuration options including adminKey
   * @param {LoggerConfig} loggerConfig - Logger configuration (optional)
   */
  constructor(serverUrl: string, options: AdminClientOptions, loggerConfig: LoggerConfig = defaultLogger) {
    serverUrl = this.ensureSuffix(serverUrl, '/api/v1');
    this.logger = makeLogger(loggerConfig);
    this.http = this.makeRequester(options, serverUrl);
  }

  private ensureSuffix(serverUrl: string, suffix: string): string {
    return serverUrl.endsWith(suffix) ? serverUrl : serverUrl + suffix;
  }

  private makeRequester(options: AdminClientOptions, serverUrl: string): HttpClient {
    if (options.adminKey) {
      this.logger.info('Using adminKey to sign admin requests');
      return new HttpClient(this.logger, serverUrl, undefined, options.adminKey);
    }

    throw new ErrorInvalidAdminClientOptions(this.logger, options);
  }

  /**
   * Check if the admin key is valid
   *
   * @returns {Promise<boolean>} True if admin key is valid
   */
  async status(): Promise<boolean> {
    return await this.http.adminRequest('admin/status');
  }

  /**
   * Get server statistics
   *
   * @returns {Promise<AdminStats>} Server statistics
   */
  async stats(): Promise<AdminStats> {
    return await this.http.adminRequest('admin/stats');
  }

  /**
   * Get a list of all access keys in the system
   *
   * @param {AdminAccessKeyFilter} conditions - Filter conditions for access keys
   * @param {Metadata} metadata - Metadata filter
   * @param {QueryPageParams} params - Pagination parameters
   * @returns {Promise<PageModel<AccessKey>>} List of access keys
   */
  async accessKeys(
    conditions: AdminAccessKeyFilter,
    metadata: Metadata,
    params: QueryPageParams,
  ): Promise<PageModel<AccessKey>> {
    const basePath = 'admin/users/keys';
    const queryString = buildQueryPath({
      metadata,
      filter: conditions,
      page: params,
    });

    return await this.http.adminRequest(`${basePath}${queryString}`, 'GET');
  }

  /**
   * Get a list of all contacts in the system
   *
   * @param {AdminContactFilter} conditions - Filter conditions for contacts
   * @param {Metadata} metadata - Metadata filter
   * @param {QueryPageParams} params - Pagination parameters
   * @returns {Promise<PageModel<Contact>>} List of contacts
   */
  async contacts(
    conditions: AdminContactFilter,
    metadata: Metadata,
    params: QueryPageParams,
  ): Promise<PageModel<Contact>> {
    const basePath = 'admin/contacts';
    const queryString = buildQueryPath({
      metadata,
      filter: conditions,
      page: params,
    });

    return await this.http.adminRequest(`${basePath}${queryString}`, 'GET');
  }

  /**
   * Update contact information
   *
   * @param {string} id - Contact ID
   * @param {string} fullName - New full name for the contact
   * @param {Metadata} metadata - Updated metadata
   * @returns {Promise<Contact>} Updated contact information
   */
  async contactUpdate(id: string, fullName: string, metadata: Metadata): Promise<Contact> {
    return await this.http.adminRequest(`admin/contacts/${id}`, 'PUT', { fullName, metadata });
  }

  /**
   * Delete a contact
   *
   * @param {string} id - ID of the contact to delete
   * @returns {Promise<void>}
   */
  async deleteContact(id: string): Promise<void> {
    await this.http.adminRequest(`admin/contacts/${id}`, 'DELETE', {});
  }

  /**
   * Accept a contact invitation
   *
   * @param {string} id - ID of the invitation to accept
   * @returns {Promise<Contact>} The accepted contact
   */
  async acceptInvitation(id: string): Promise<Contact> {
    return await this.http.adminRequest(`admin/invitations/${id}`, 'POST', {});
  }

  /**
   * Reject a contact invitation
   *
   * @param {string} id - ID of the invitation to reject
   * @returns {Promise<void>}
   */
  async rejectInvitation(id: string): Promise<void> {
    return await this.http.adminRequest(`admin/invitations/${id}`, 'DELETE', {});
  }

  /**
   * Get a transaction by ID
   *
   * @param {string} id - Transaction ID
   * @returns {Promise<AdminTx>} Transaction details
   */
  async transaction(id: string): Promise<AdminTx> {
    return await this.http.adminRequest(`admin/transactions/${id}`, 'GET');
  }

  /**
   * Get a list of all transactions
   *
   * @param {TransactionFilter} conditions - Filter conditions for transactions
   * @param {Metadata} metadata - Metadata filter
   * @param {QueryPageParams} params - Pagination parameters
   * @returns {Promise<PageModel<AdminTx>>} List of transactions
   */
  async transactions(
    conditions: TransactionFilter,
    metadata: Metadata,
    params: QueryPageParams,
  ): Promise<PageModel<AdminTx>> {
    const basePath = 'admin/transactions';
    const queryString = buildQueryPath({
      filter: conditions,
      metadata,
      page: params,
    });
    return await this.http.adminRequest(`${basePath}${queryString}`, 'GET');
  }

  /**
   * Get a list of all UTXOs
   *
   * @param {AdminUtxoFilter} conditions - Filter conditions for UTXOs
   * @param {Metadata} metadata - Metadata filter
   * @param {QueryPageParams} params - Pagination parameters
   * @returns {Promise<PageModel<Utxo>>} List of UTXOs
   */
  async utxos(conditions: AdminUtxoFilter, metadata: Metadata, params: QueryPageParams): Promise<PageModel<Utxo>> {
    const basePath = 'admin/utxos';
    const queryString = buildQueryPath({
      filter: conditions,
      metadata,
      page: params,
    });

    return await this.http.adminRequest(`${basePath}${queryString}`, 'GET');
  }

  /**
   * Get a list of all xPubs
   *
   * @param {XpubFilter} conditions - Filter conditions for xPubs
   * @param {Metadata} metadata - Metadata filter
   * @param {QueryPageParams} params - Pagination parameters
   * @returns {Promise<PageModel<XPub>>} List of xPubs
   */
  async xPubs(conditions: XpubFilter, metadata: Metadata, params: QueryPageParams): Promise<PageModel<XPub>> {
    const basePath = 'admin/users';
    const queryString = buildQueryPath({
      filter: conditions,
      metadata,
      page: params,
    });

    return await this.http.adminRequest(`${basePath}${queryString}`, 'GET');
  }

  /**
   * Register a new xPub
   *
   * @param {string} rawXPub - Raw xPub key to register
   * @param {Metadata} metadata - Metadata for the xPub
   * @returns {Promise<XPub>} Registered xPub information
   */
  async createXPub(rawXPub: string, metadata: Metadata): Promise<XPub> {
    return await this.http.adminRequest('admin/users', 'POST', {
      key: rawXPub,
      metadata,
    });
  }

  /**
   * Get a paymail by address
   *
   * @param {string} id - Paymail ID or address
   * @returns {Promise<PaymailAddress>} Paymail information
   */
  async paymail(id: string): Promise<PaymailAddress> {
    return await this.http.adminRequest(`admin/paymails/${id}`, 'GET');
  }

  /**
   * Get a list of all paymails
   *
   * @param {AdminPaymailFilter} conditions - Filter conditions for paymails
   * @param {Metadata} metadata - Metadata filter
   * @param {QueryPageParams} params - Pagination parameters
   * @returns {Promise<PageModel<PaymailAddress>>} List of paymail addresses
   */
  async paymails(
    conditions: AdminPaymailFilter,
    metadata: Metadata,
    params: QueryPageParams,
  ): Promise<PageModel<PaymailAddress>> {
    const basePath = 'admin/paymails';
    const queryString = buildQueryPath({
      metadata,
      page: params,
      filter: conditions,
    });

    return await this.http.adminRequest(`${basePath}${queryString}`, 'GET');
  }

  /**
   * Create a new paymail
   *
   * @param {string} rawXPub - Raw xpub to register the paymail to
   * @param {string} address - Paymail address (e.g., alias@domain.com)
   * @param {string} publicName - Public name for the paymail
   * @param {string} avatar - Avatar URL
   * @param {Metadata} metadata - Additional metadata
   * @returns {Promise<PaymailAddress>} Created paymail address
   */
  async createPaymail(
    rawXPub: string,
    address: string,
    publicName: string,
    avatar: string,
    metadata: Metadata,
  ): Promise<PaymailAddress> {
    return await this.http.adminRequest('admin/paymails', 'POST', {
      metadata,
      key: rawXPub,
      address,
      publicName,
      avatar,
    });
  }

  /**
   * Delete a paymail
   * @param {string} id - Paymail Id of user to be deleted
   */
  async deletePaymail(id: string): Promise<void> {
    await this.http.adminRequest(`admin/paymails/${id}`, 'DELETE');
  }

  /**
   * Get webhook subscriptions
   *
   * @returns {Promise<Webhook[]>} List of webhook subscriptions
   */
  async webhooks(): Promise<Webhook[]> {
    return await this.http.adminRequest('admin/webhooks/subscriptions', 'GET');
  }

  /**
   * Subscribe to webhook
   *
   * @param {string} url - Webhook URL
   * @param {string} tokenHeader - Header name for the authentication token
   * @param {string} tokenValue - Value of the authentication token
   * @returns {Promise<void>}
   */
  async subscribeWebhook(url: string, tokenHeader: string, tokenValue: string): Promise<void> {
    return await this.http.adminRequest('admin/webhooks/subscriptions', 'POST', { url, tokenHeader, tokenValue });
  }

  /**
   * Unsubscribe from webhook
   *
   * @param {string} url - URL of the webhook to unsubscribe
   * @returns {Promise<void>}
   */
  async unsubscribeWebhook(url: string): Promise<void> {
    return await this.http.adminRequest('admin/webhooks/subscriptions', 'DELETE', { url });
  }

  /**
   * Create new contact
   *
   * @param {string} contactPaymail - Paymail address for the new contact
   * @param {NewContact} newContact - Contact information
   * @returns {Promise<Contact>} Created contact
   */
  async createContact(contactPaymail: string, newContact: NewContact): Promise<Contact> {
    return await this.http.adminRequest(`admin/contacts/${contactPaymail}`, 'POST', newContact);
  }

  /**
   * Confirm contacts
   *
   * @param {string} paymailA - First contact's paymail
   * @param {string} paymailB - Second contact's paymail
   * @returns {Promise<void>}
   */
  async confirmContacts(paymailA: string, paymailB: string): Promise<void> {
    return await this.http.adminRequest('/admin/contacts/confirmations', 'POST', { paymailA, paymailB });
  }

  /**
   * Unconfirm contact
   *
   * @param {string} id - ID of the contact to unconfirm
   * @returns {Promise<void>}
   */
    async unconfirmContact(id: string): Promise<void> {
      return await this.http.adminRequest(`/admin/contacts/unconfirm/${id}`, 'PATCH');
    }

  /**
   * Get shared configuration
   *
   * @returns {Promise<SharedConfig>} Shared configuration settings
   */
  async sharedConfig(): Promise<SharedConfig> {
    return await this.http.adminRequest('configs/shared', 'GET');
  }
}

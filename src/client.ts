import {
  AccessKey,
  AccessKeys,
  AccessKeyWithSigning,
  AdminKey,
  AdminStats,
  ClientOptions,
  Contact,
  Contacts,
  Destination,
  Destinations,
  DraftTx,
  Metadata,
  PaymailAddress,
  PaymailAddresses,
  QueryParams,
  Recipients,
  SharedConfig,
  TransactionConfigInput,
  Tx,
  Txs,
  Utxo,
  Utxos,
  XprivWithSigning,
  XPub,
  XPubs,
  XpubWithoutSigning,
} from './types';
import { defaultLogger, Logger, LoggerConfig, makeLogger } from './logger';
import { HttpClient } from './httpclient';
import {
  ErrorInvalidOptions,
  ErrorNoXPrivToGenerateTOTP,
  ErrorNoXPrivToSignTransaction,
  ErrorNoXPrivToValidateTOTP,
  ErrorTxIdsDontMatchToDraft,
} from './errors';
import { HD, P2PKH, PrivateKey, Transaction } from '@bsv/sdk';
import {
  AccessKeyFilter,
  ContactFilter,
  DestinationFilter,
  AdminPaymailFilter,
  TransactionFilter,
  UtxoFilter,
  XpubFilter,
  AdminUtxoFilter,
  AdminAccessKeyFilter,
} from './filters';
import { validateTotpForContact, generateTotpForContact, DEFAULT_TOTP_DIGITS, DEFAULT_TOTP_PERIOD } from './utils/totp';

/**
 * SpvWallet class
 *
 * @constructor
 * @example
 * const SpvWalletClient = new SpvWalletClient(<serverUrl>, {
 *   xPriv: <xpriv...>
 * })
 */
export class SpvWalletClient {
  logger: Logger;
  http: HttpClient;

  private xPriv?: HD;

  constructor(serverUrl: string, options: XpubWithoutSigning, loggerConfig?: LoggerConfig);
  constructor(serverUrl: string, options: AccessKeyWithSigning, loggerConfig?: LoggerConfig);
  constructor(serverUrl: string, options: XprivWithSigning, loggerConfig?: LoggerConfig);
  constructor(serverUrl: string, options: AdminKey, loggerConfig?: LoggerConfig);
  constructor(serverUrl: string, options: ClientOptions, loggerConfig: LoggerConfig = defaultLogger) {
    this.logger = makeLogger(loggerConfig);
    this.http = this.makeRequester(options, serverUrl);
  }

  get xPrivKey(): HD | undefined {
    return this.xPriv;
  }

  private makeRequester(options: ClientOptions, serverUrl: string): HttpClient {
    if (options.adminKey) {
      this.logger.info('Using adminKey to sign admin requests');
    }

    if ('xPub' in options) {
      this.logger.info('Using XPub. SendToRecipients function will not be available.');
      return new HttpClient(this.logger, serverUrl, options.xPub, options.adminKey);
    }

    if ('xPriv' in options) {
      this.logger.info('Using xPriv to sign requests');
      this.xPriv = new HD().fromString(options.xPriv);
      return new HttpClient(this.logger, serverUrl, this.xPriv, options.adminKey);
    }

    if ('accessKey' in options) {
      this.logger.info('Using accessKey to sign requests. SendToRecipients will not be available.');
      const signingKey = PrivateKey.fromString(options.accessKey, 'hex');
      return new HttpClient(this.logger, serverUrl, signingKey, options.adminKey);
    }

    if (options.adminKey != null) {
      this.logger.warn('Non-admin requests will not work because xPub, xPriv nor accessKey is provided.');
      return new HttpClient(this.logger, serverUrl, undefined, options.adminKey);
    }

    throw new ErrorInvalidOptions(this.logger, options);
  }

  /**
   * Admin only: Return whether the admin key is valid on the server
   *
   * @return {boolean}
   */
  async AdminGetStatus(): Promise<boolean> {
    return await this.http.adminRequest(`admin/status`);
  }

  /**
   * Admin only: Get stats about the SPV Wallet server
   *
   * @return {AdminStats}
   */
  async AdminGetStats(): Promise<AdminStats> {
    return await this.http.adminRequest(`admin/stats`);
  }

  /**
   * Admin only: Get a list of all access keys in the system, filtered by conditions, metadata and queryParams
   *
   * @param {AdminAccessKeyFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {AccessKeys}
   */
  async AdminGetAccessKeys(
    conditions: AdminAccessKeyFilter,
    metadata: Metadata,
    params: QueryParams,
  ): Promise<AccessKeys> {
    return await this.http.adminRequest(`admin/access-keys/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  /**
   * Admin only: Get a count of all access keys in the system, filtered by conditions, metadata and queryParams
   *
   * @param {AdminAccessKeyFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetAccessKeysCount(conditions: AdminAccessKeyFilter, metadata: Metadata): Promise<number> {
    return await this.http.adminRequest(`admin/access-keys/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Admin only: Get a list of all contacts in the system, filtered by conditions, metadata and queryParams
   *
   * @param {ContactFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {Contacts}
   */
  async AdminGetContacts(conditions: ContactFilter, metadata: Metadata, params: QueryParams): Promise<Contacts> {
    return await this.http.adminRequest(`admin/contact/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  /**
   * Admin only: Update contact fullName and metadata
   *
   * @param {string} id              Contact ID to update
   * @param {string} fullName        New full name of the contact
   * @param {Metadata} metadata      Key value object to use to filter the documents by the metadata
   * @constructor
   */
  async AdminUpdateContact(id: string, fullName: string, metadata: Metadata): Promise<Contact> {
    return await this.http.adminRequest(`admin/contact/${id}`, 'PATCH', { fullName, metadata });
  }

  /**
   * Admin only: Delete a contact
   *
   * @param {string} id Contact ID to delete
   * @return void
   */
  async AdminDeleteContact(id: string): Promise<void> {
    await this.http.adminRequest(`admin/contact/${id}`, 'DELETE', {});
  }

  /**
   * Admin only: Accept a contact request
   *
   * @param {string} id Contact ID to accept
   * @return {Contact}
   */
  async AdminAcceptContact(id: string): Promise<Contact> {
    return await this.http.adminRequest(`admin/contact/accepted/${id}`, 'PATCH', {});
  }

  /**
   * Admin only: Reject a contact request
   *
   * @param {string} id Contact ID to reject
   * @return {Contact}
   */
  async AdminRejectContact(id: string): Promise<Contact> {
    return await this.http.adminRequest(`admin/contact/rejected/${id}`, 'PATCH', {});
  }

  /**
   * Admin only: Get a list of all destinations in the system, filtered by conditions, metadata and queryParams
   *
   * @param {DestinationFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {Destinations}
   */
  async AdminGetDestinations(
    conditions: DestinationFilter,
    metadata: Metadata,
    params: QueryParams,
  ): Promise<Destinations> {
    return await this.http.adminRequest(`admin/destinations/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  /**
   * Admin only: Get a count of all destinations in the system, filtered by conditions, metadata and queryParams
   *
   * @param {DestinationFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetDestinationsCount(conditions: DestinationFilter, metadata: Metadata): Promise<number> {
    return await this.http.adminRequest(`admin/destinations/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Admin only: Get a paymail by address
   *
   * @param address string Paymail address (i.e. alias@example.com)
   * @return {PaymailAddress}
   */
  async AdminGetPaymail(address: string): Promise<PaymailAddress> {
    return await this.http.adminRequest(`admin/paymail/get`, 'POST', { address });
  }

  /**
   * Admin only: Get a list of all paymails in the system, filtered by conditions, metadata and queryParams
   *
   * @param {AdminPaymailFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {PaymailAddresses}
   */
  async AdminGetPaymails(
    conditions: AdminPaymailFilter,
    metadata: Metadata,
    params: QueryParams,
  ): Promise<PaymailAddresses> {
    return await this.http.adminRequest(`admin/paymails/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  /**
   * Admin only: Get a count of all paymails in the system, filtered by conditions, metadata and queryParams
   * To get a count of not-deleted paymails, use the condition: { deleted_at: null }
   *
   * @param {AdminPaymailFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetPaymailsCount(conditions: AdminPaymailFilter, metadata: Metadata): Promise<number> {
    return await this.http.adminRequest(`admin/paymails/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Admin only: Create a new paymail for an xPub
   *
   * @param {string} rawXPub Raw xPub to register the paymail to
   * @param {string} address Paymail address (i.e. alias@example.com)
   * @param {string} public_name Public name for the user to return in Paymail address resolution requests
   * @param {string} avatar Avatar of the user to return in Paymail address resolution requests
   * @return {PaymailAddress}
   */
  async AdminCreatePaymail(
    rawXPub: string,
    address: string,
    public_name: string,
    avatar: string,
  ): Promise<PaymailAddress> {
    return await this.http.adminRequest(`admin/paymail/create`, 'POST', {
      key: rawXPub,
      address,
      public_name,
      avatar,
    });
  }

  /**
   * Admin only: Delete a paymail
   *
   * @param address string Paymail address (ie. example@spv-wallet.org)
   * @return void
   */
  async AdminDeletePaymail(address: string): Promise<void> {
    await this.http.adminRequest(`admin/paymail/delete`, 'DELETE', { address });
  }

  /**
   * Admin only: Get a list of all transactions in the system, filtered by conditions, metadata and queryParams
   *
   * @param {TransactionFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {Txs}
   */
  async AdminGetTransactions(conditions: TransactionFilter, metadata: Metadata, params: QueryParams): Promise<Txs> {
    return await this.http.adminRequest(`admin/transactions/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  /**
   * Admin only: Get a count of all transactions in the system, filtered by conditions, metadata and queryParams
   *
   * @param {TransactionFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetTransactionsCount(conditions: TransactionFilter, metadata: Metadata): Promise<number> {
    return await this.http.adminRequest(`admin/transactions/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Admin only: Get a list of all utxos in the system, filtered by conditions, metadata and queryParams
   *
   * @param {AdminUtxoFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {Utxos}
   */
  async AdminGetUtxos(conditions: AdminUtxoFilter, metadata: Metadata, params: QueryParams): Promise<Utxos> {
    return await this.http.adminRequest(`admin/utxos/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  /**
   * Admin only: Get a count of all utxos in the system, filtered by conditions, metadata and queryParams
   *
   * @param {AdminUtxoFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetUtxosCount(conditions: AdminUtxoFilter, metadata: Metadata): Promise<number> {
    return await this.http.adminRequest(`admin/utxos/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Admin only: Get a list of all xpubs in the system, filtered by conditions, metadata and queryParams
   *
   * @param {XpubFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {XPubs}
   */
  async AdminGetXPubs(conditions: XpubFilter, metadata: Metadata, params: QueryParams): Promise<XPubs> {
    return await this.http.adminRequest(`admin/xpubs/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  /**
   * Admin only: Get a count of all xpubs in the system, filtered by conditions, metadata and queryParams
   *
   * @param {XpubFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetXPubsCount(conditions: XpubFilter, metadata: Metadata): Promise<number> {
    return await this.http.adminRequest(`admin/xpubs/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Admin only: Register a new xPub into the SPV Wallet
   *
   * @param {string} rawXPub    XPub string
   * @param {Metadata} metadata Key value object to use to add to the xpub
   * @return {XPub}             The newly registered xpub
   */
  async AdminNewXpub(rawXPub: string, metadata: Metadata): Promise<XPub> {
    return await this.http.adminRequest(`admin/xpub`, 'POST', {
      key: rawXPub,
      metadata,
    });
  }

  /**
   * Admin only: Record a transaction without any of the normal checks
   *
   * @param {string} hex  Hex string of the transaction
   * @return {Tx}
   */
  async AdminRecordTransaction(hex: string): Promise<Tx> {
    return await this.http.adminRequest(`admin/transactions/record`, 'POST', { hex });
  }

  /**
   * Get information about the xpub from the server of the current user
   *
   * @return {XPub}
   */
  async GetXPub(): Promise<XPub> {
    return await this.http.request(`xpub`);
  }

  /**
   * Update the metadata of the xpub of the current user
   *
   * Admin key should be set to use this method
   *
   * @param {Metadata} metadata Key value object to use to update the metadata. To delete keys add a key with null value
   * @return {XPub}
   */
  async UpdateXPubMetadata(metadata: Metadata): Promise<XPub> {
    return await this.http.request(`xpub`, 'PATCH', { metadata });
  }

  /**
   * Get an access key by ID
   *
   * @param {string} id The database ID of the access key
   * @return {AccessKey}
   */
  async GetAccessKey(id: string): Promise<AccessKey> {
    return await this.http.request(`access-key?id=${id}`);
  }

  /**
   * Get a list of all access keys for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {AccessKeyFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} queryParams Database query parameters for page, page size and sorting
   * @return {AccessKeys}
   */
  async GetAccessKeys(conditions: AccessKeyFilter, metadata: Metadata, queryParams: QueryParams): Promise<AccessKeys> {
    return await this.http.request(`access-key/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || '',
      sort_direction: queryParams?.sort_direction || '',
    });
  }

  /**
   * Get a count of all access keys for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {AccessKeyFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async GetAccessKeysCount(conditions: AccessKeyFilter, metadata: Metadata): Promise<number> {
    return await this.http.request(`access-key/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Create a new access key, with the (optional) metadata
   *
   * This method returns the newly created access key, with the private key, which is only given out this once
   *
   * @param metadata Metadata Metadata to add to the new access key
   * @return {AccessKey}
   */
  async CreateAccessKey(metadata: Metadata): Promise<AccessKey> {
    return await this.http.request(`access-key`, 'POST', { metadata });
  }

  /**
   * Revoke an access key and invalidate in the database
   *
   * After this function is successfully called, the access key cannot be used anymore on an SPV Wallet server
   *
   * @param id string The database ID of the access key to revoke
   * @return {AccessKey}
   */
  async RevokeAccessKey(id: string): Promise<AccessKey> {
    return await this.http.request(`access-key?id=${id}`, 'DELETE');
  }

  /**
   * Get a destination of the current user by database ID
   *
   * @param id string Database ID of destination (sha256 hash of locking script)
   * @return {Destination}
   */
  async GetDestinationByID(id: string): Promise<Destination> {
    return await this.http.request(`destination?id=${id}`);
  }

  /**
   * Get a destination of the current user by locking script
   *
   * @param locking_script string Locking script (script pub key)
   * @return {Destination}
   */
  async GetDestinationByLockingScript(locking_script: string): Promise<Destination> {
    return await this.http.request(`destination?locking_script=${locking_script}`);
  }

  /**
   * Get a destination of the current user by bitcoin address
   *
   * @param address string Bitcoin address
   * @return {Destination}
   */
  async GetDestinationByAddress(address: string): Promise<Destination> {
    return await this.http.request(`destination?address=${address}`);
  }

  /**
   * Get a list of all destinations for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {DestinationFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} queryParams Database query parameters for page, page size and sorting
   * @return {Destinations}
   */
  async GetDestinations(
    conditions: DestinationFilter,
    metadata: Metadata,
    queryParams: QueryParams,
  ): Promise<Destinations> {
    return await this.http.request(`destination/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || '',
      sort_direction: queryParams?.sort_direction || '',
    });
  }

  /**
   * Get a count of all destinations for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {DestinationFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async GetDestinationsCount(conditions: DestinationFilter, metadata: Metadata): Promise<number> {
    return await this.http.request(`destination/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Create a new destination to receive bsv with and return that destination
   *
   * This function allows you to create a destination that will be monitored on-chain and will import any transactions
   * related to that destination into SPV Wallet. This is legacy functionality in Bitcoin and should only be used if a p2p
   * option (paymail) is not possible. Use sparingly.
   *
   * @param {Metadata} metadata Key value object to attach to the new destination
   * @return {Destination}
   */
  async NewDestination(metadata: Metadata): Promise<Destination> {
    return await this.http.request(`destination`, 'POST', { metadata });
  }

  /**
   * Updated the metadata object of the destination given by ID with new keys (does not overwrite the old object)
   *
   * To remove a key from the metadata object, add a key to set with a value of `null`
   *
   * @param {string} id Database ID of the destination
   * @param {Metadata} metadata Key value object to append to the metadata of the destination
   * @return {Destination}
   */
  async UpdateDestinationMetadataByID(id: string, metadata: Metadata): Promise<Destination> {
    return await this.http.request(`destination`, 'PATCH', {
      id,
      metadata,
    });
  }

  /**
   * Updated the metadata object of the destination given by locking script with new keys (does not overwrite the old object)
   *
   * To remove a key from the metadata object, add a key to set with a value of `null`
   *
   * @param {string} locking_script Locking script of the destination
   * @param {Metadata} metadata Key value object to append to the metadata of the destination
   * @return {Destination}
   */
  async UpdateDestinationMetadataByLockingScript(locking_script: string, metadata: Metadata): Promise<Destination> {
    return await this.http.request(`destination`, 'PATCH', {
      locking_script,
      metadata,
    });
  }

  /**
   * Updated the metadata object of the destination given by address with new keys (does not overwrite the old object)
   *
   * To remove a key from the metadata object, add a key to set with a value of `null`
   *
   * @param {string} address Address of the destination
   * @param {Metadata} metadata Key value object to append to the metadata of the destination
   * @return {Destination}
   */
  async UpdateDestinationMetadataByAddress(address: string, metadata: Metadata): Promise<Destination> {
    return await this.http.request(`destination`, 'PATCH', {
      address,
      metadata,
    });
  }

  /**
   * Get a list of all contacts for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {ContactFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} queryParams Database query parameters for page, page size and sorting
   * @return {Contacts}
   */
  async GetContacts(conditions: ContactFilter, metadata: Metadata, queryParams: QueryParams): Promise<Contacts> {
    return await this.http.request(`contact/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || '',
      sort_direction: queryParams?.sort_direction || '',
    });
  }

  /**
   * Upsert will add a new contact or modify an existing one.
   *
   * @param {string} paymail            Contact paymail to add or modify
   * @param {string} fullName           Full name of the contact which could be shown instead of whole paymail address.
   * @param {string} requesterPaymail   Paymail of the requester
   * @param {Metadata} metadata         Key value object to use to filter the documents by the metadata
   * @return {Contact}
   */
  async UpsertContact(
    paymail: string,
    fullName: string,
    requesterPaymail: string,
    metadata: Metadata,
  ): Promise<Contact> {
    let payload = { fullName, requesterPaymail, metadata };
    if (requesterPaymail !== '') {
      payload['requesterPaymail'] = requesterPaymail;
    }
    return await this.http.request(`contact/${paymail}`, 'PUT', payload);
  }

  /**
   * Accept a contact request
   *
   * @param {string} paymail Contact paymail to modify
   * @return {void}
   */
  async AcceptContact(paymail: string): Promise<void> {
    return await this.http.request(`contact/accepted/${paymail}`, 'PATCH');
  }

  /**
   * Reject a contact request
   *
   * @param {string} paymail Contact paymail to modify
   * @return {void}
   */
  async RejectContact(paymail: string): Promise<void> {
    return await this.http.request(`contact/rejected/${paymail}`, 'PATCH');
  }

  /**
   * Confirm a contact request
   *
   * @param {string} passcode - The passcode for the contact
   * @param contact
   * @param {string} paymail Contact paymail
   * @param {number} period - The period for the TOTP
   * @param {number} digits - The number of digits for the TOTP
   * @returns {Promise<void>}
   * @throws {Error} If the TOTP is invalid
   */
  async ConfirmContact(
    passcode: string,
    contact: Contact,
    paymail: string,
    period: number,
    digits: number,
  ): Promise<void> {
    try {
      const isTotpValid = this.ValidateTotpForContact(contact, passcode, paymail, period, digits);
      if (!isTotpValid) {
        throw new Error('TOTP is invalid');
      }

      return await this.http.request(`contact/confirmed/${paymail}`, 'PATCH');
    } catch (error) {
      throw new Error('TOTP validation failed', { cause: error });
    }
  }

  /**
   * Get all details of the transaction by the given ID
   *
   * @param {string} txID Transaction ID
   * @return {Tx}
   */
  async GetTransaction(txID: string): Promise<Tx> {
    return await this.http.request(`transaction?id=${txID}`, 'GET');
  }

  /**
   * Get a list of all transactions for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {TransactionFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} queryParams Database query parameters for page, page size and sorting
   * @return {Txs}
   */
  async GetTransactions(conditions: TransactionFilter, metadata: Metadata, queryParams: QueryParams): Promise<Txs> {
    return await this.http.request(`transaction/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || '',
      sort_direction: queryParams?.sort_direction || '',
    });
  }

  /**
   * Get a count of all transactions for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {TransactionFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async GetTransactionsCount(conditions: TransactionFilter, metadata: Metadata): Promise<number> {
    return await this.http.request(`transaction/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Get all details of the utxo by the given ID
   *
   * @param {string} tx_id Transaction ID of the UTXO
   * @param {number} output_index Index of output within the transaction of the UTXO
   * @return {Utxo}
   */
  async GetUtxo(tx_id: string, output_index: number): Promise<Utxo> {
    return await this.http.request(`utxo?tx_id=${tx_id}&output_index=${output_index}`);
  }

  /**
   * Get a list of all utxos for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {UtxoFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} queryParams Database query parameters for page, page size and sorting
   * @return {Utxos}
   */
  async GetUtxos(conditions: UtxoFilter, metadata: Metadata, queryParams: QueryParams): Promise<Utxos> {
    return await this.http.request(`utxo/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || '',
      sort_direction: queryParams?.sort_direction || '',
    });
  }

  /**
   * Get a count of all utxos for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {UtxoFilter} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async GetUtxosCount(conditions: UtxoFilter, metadata: Metadata): Promise<number> {
    return await this.http.request(`utxo/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Create a draft transaction to the recipients given
   *
   * This is a helper function to easily create a new draft transaction to a list of recipients
   *
   * @see {@link SendToRecipients}
   * @param {Recipients} recipients A list of recipients and a satoshi value to send to them
   * @param {Metadata} metadata     Key value object to use to add to the draft transaction
   * @return {DraftTx}     Complete draft transaction object from SPV Wallet, all configuration options filled in
   */
  async DraftToRecipients(recipients: Recipients, metadata: Metadata): Promise<DraftTx> {
    const transactionConfig: TransactionConfigInput = {
      outputs: recipients,
    };

    return await this.http.request(`transaction`, 'POST', {
      config: transactionConfig,
      metadata,
    });
  }

  /**
   * Create a draft transaction using the given transaction config
   *
   * @param {TransactionConfigInput} transactionConfig Configuration of the new transaction
   * @param {Metadata} metadata                        Key value object to use to add to the draft transaction
   * @return {DraftTx}                        Complete draft transaction object from SPV Wallet, all configuration options filled in
   */
  async DraftTransaction(transactionConfig: TransactionConfigInput, metadata: Metadata): Promise<DraftTx> {
    return await this.http.request(`transaction`, 'POST', {
      config: transactionConfig,
      metadata,
    });
  }

  /**
   * Helper function to create a draft, sign it and send it to a list of recipients
   *
   * @param {Recipients} recipients A list of recipients and a satoshi value to send to them
   * @param {Metadata} metadata     Key value object to use to add to the (draft) transaction
   * @return {Tx}          The final transaction object, including the hex of the Bitcoin transaction
   * @example
   * // This function is a shorthand for:
   * const draft = await spvWalletClient.DraftToRecipients(recipients, metadata);
   * const finalized = await spvWalletClient.SignTransaction(draft);
   * const tx = await spvWalletClient.RecordTransaction(finalized, draft.id, metadata)
   */
  async SendToRecipients(recipients: Recipients, metadata: Metadata): Promise<Tx> {
    const draft = await this.DraftToRecipients(recipients, metadata);
    const finalized = await this.SignTransaction(draft);
    return this.RecordTransaction(finalized, draft.id, metadata);
  }

  /**
   * Finalize and sign the given draft transaction
   *
   * @param {DraftTx} draftTransaction Draft transaction object
   * @return {string} Final transaction hex
   */
  async SignTransaction(draftTransaction: DraftTx): Promise<string> {
    if (!this.xPriv) {
      throw new ErrorNoXPrivToSignTransaction();
    }

    const xPriv = this.xPriv;
    const txDraft: Transaction = Transaction.fromHex(draftTransaction.hex);

    draftTransaction.configuration.inputs?.forEach((input, index) => {
      const { destination } = input;
      if (destination == null) {
        throw new Error('Unexpected input that does not contain destination which is required for signing');
      }

      // derive private key (m/chain/num)
      let hdWallet = xPriv.deriveChild(destination.chain).deriveChild(destination.num);

      if (destination.paymail_external_derivation_num != null) {
        // derive private key (m/chain/num/paymail_num)
        hdWallet = hdWallet.deriveChild(destination.paymail_external_derivation_num);
      }

      // small sanity check for the inputs
      if (
        input.transaction_id != txDraft.inputs[index].sourceTXID ||
        input.output_index != txDraft.inputs[index].sourceOutputIndex
      ) {
        throw new ErrorTxIdsDontMatchToDraft(this.logger, input, index, txDraft.inputs[index]);
      }

      txDraft.inputs[index].unlockingScriptTemplate = new P2PKH().unlock(
        hdWallet.privKey,
        'single',
        false,
        input.satoshis,
        new P2PKH().lock(destination.address),
      );

      txDraft.inputs[index].sourceOutputIndex = input.output_index;
      txDraft.inputs[index].sourceTXID = input.transaction_id;
    });

    await txDraft.sign();

    return txDraft.toHex();
  }

  /**
   * Record a Bitcoin transaction (in hex) into SPV Wallet
   *
   * This will only work of an input or output of the transaction can be related to an SPV Wallet user. SPV Wallet does not record
   * unrelated transaction into its database.
   *
   * @param {string} hex         Hex string of the Bitcoin transaction
   * @param {string} referenceID Optional reference ID (draft transaction ID)
   * @param {Metadata} metadata  Key value object to use to add to the transaction
   * @return {Tx}       The SPV Wallet transaction object
   */
  async RecordTransaction(hex: string, referenceID: string, metadata: Metadata): Promise<Tx> {
    return await this.http.request(`transaction/record`, 'POST', {
      hex,
      reference_id: referenceID,
      metadata,
    });
  }

  /**
   * Updated the metadata object of the transaction given by txID with new keys (does not overwrite the old object)
   *
   * To remove a key from the metadata object, add a key to set with a value of `null`
   *
   * @param {string} txID       The ID of the transaction
   * @param {Metadata} metadata Key value object to use to add to the transaction
   * @return {Tx}      The complete SPV Wallet transaction object, with the new changes
   */
  async UpdateTransactionMetadata(txID: string, metadata: Metadata): Promise<Tx> {
    return await this.http.request(`transaction`, 'PATCH', {
      id: txID,
      metadata,
    });
  }

  /**
   * Retrieves the shared configuration from the server.
   * @returns {SharedConfig} A promise that resolves to the shared configuration.
   */
  async GetSharedConfig(): Promise<SharedConfig> {
    if (this.http.hasAdminKey()) {
      return await this.http.adminRequest(`shared-config`, 'GET');
    }
    return await this.http.request(`shared-config`, 'GET');
  }

  /**
   * Generates a TOTP for a given contact
   *
   * @param contact - The Contact
   * @param period - The TOTP period (default: 30)
   * @param digits - The number of TOTP digits (default: 2)
   * @returns The generated TOTP as a string
   */
  GenerateTotpForContact(
    contact: Contact,
    period: number = DEFAULT_TOTP_PERIOD,
    digits: number = DEFAULT_TOTP_DIGITS,
  ): string {
    if (!this.xPrivKey) {
      throw new ErrorNoXPrivToGenerateTOTP();
    }
    return generateTotpForContact(this.xPrivKey, contact, period, digits);
  }

  /**
   * Validates a TOTP for a given contact
   *
   * @param passcode - The TOTP passcode to validate
   * @param requesterPaymail - The paymail of the requester
   * @param period - The TOTP period (default: 30)
   * @param digits - The number of TOTP digits (default: 2)
   * @returns A boolean indicating whether the TOTP is valid
   */
  ValidateTotpForContact(
    contact: Contact,
    passcode: string,
    requesterPaymail: string,
    period: number = DEFAULT_TOTP_PERIOD,
    digits: number = DEFAULT_TOTP_DIGITS,
  ) {
    if (!this.xPrivKey) {
      throw new ErrorNoXPrivToValidateTOTP();
    }
    return validateTotpForContact(this.xPrivKey, contact, passcode, requesterPaymail, period, digits);
  }
}

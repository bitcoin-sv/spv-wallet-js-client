import bsv from 'bsv'
import { AuthHeader, setSignature } from './authentication'
import {
  AccessKey,
  AccessKeys,
  AdminStats,
  BlockHeaders,
  ClientOptions,
  Conditions,
  Destination,
  Destinations,
  DraftTransaction,
  Metadata,
  QueryParams,
  PaymailAddress,
  PaymailAddresses,
  Recipients,
  Transaction,
  TransactionConfigInput,
  Transactions,
  Utxos,
  XPub,
  XPubs,
  Utxo,
} from './types'
import logger from './logger'

/**
 * SpvWallet class
 *
 * @constructor
 * @example
 * const SpvWalletClient = new SpvWalletClient(<serverUrl>, {
 *   signRequest: true,
 *   xPriv: <xpriv...>
 * })
 */
export class SpvWalletClient {
  serverUrl: string
  options: ClientOptions
  adminKey: bsv.HDPrivateKey | null

  constructor(serverUrl: string, options: ClientOptions) {
    this.serverUrl = serverUrl
    this.adminKey = null

    if (options.xPriv) {
      options.xPrivString = options.xPriv.toString()
      options.xPub = options.xPriv.hdPublicKey
      options.xPubString = options.xPub.toString()
    } else if (options.xPrivString) {
      options.xPriv = bsv.HDPrivateKey.fromString(options.xPrivString)
      options.xPub = options.xPriv?.hdPublicKey
      options.xPubString = options.xPub?.toString()
    } else if (options.xPub) {
      options.xPriv = undefined
      options.xPrivString = undefined
      options.xPubString = options.xPub.toString()
    } else if (options.xPubString) {
      options.xPriv = undefined
      options.xPrivString = undefined
      options.xPub = bsv.HDPublicKey.fromString(options.xPubString)
    } else if (options.accessKey) {
      options.xPriv = undefined
      options.xPrivString = undefined
      options.xPub = undefined
      options.xPubString = undefined
      options.accessKeyString = options.accessKey.toString()
    }

    this.options = options

    if (options.adminKey) {
      this.SetAdminKey(options.adminKey)
    }
  }

  /**
   * Set an admin key to use for transactions
   *
   * @param {string} adminKey Admin xPriv
   * @return void
   */
  SetAdminKey(adminKey: string): void {
    this.options.adminKey = adminKey
    this.adminKey = bsv.HDPrivateKey.fromString(adminKey)
  }

  /**
   * Set debugging on (true) and off (false)
   *
   * @param {boolean} debug
   * @return void
   */
  SetDebug(debug: boolean): void {
    this.options.debug = debug
  }

  /**
   * Set whether to sign all requests to the server
   *
   * This option is on (true) by default and should only be turned off in development. The SPV Wallet server needs to accept
   * unsigned requests for this to work.
   *
   * @param {boolean} signRequest
   * @return void
   */
  SetSignRequest(signRequest: boolean): void {
    this.options.signRequest = signRequest
  }

  /**
   * Returns whether debugging is on (true) or off (false)
   *
   * @return {boolean}
   */
  IsDebug(): boolean {
    return !!this.options.debug
  }

  /**
   * Returns whether all requests will be fully signed
   *
   * @return {boolean}
   */
  IsSignRequest(): boolean {
    return !!this.options.signRequest
  }

  /**
   * Admin only: Return whether the admin key is valid on the server
   *
   * @return {boolean}
   */
  async AdminGetStatus(): Promise<boolean> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/status`)
  }

  /**
   * Admin only: Get stats about the SPV Wallet server
   *
   * @return {AdminStats}
   */
  async AdminGetStats(): Promise<AdminStats> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/stats`)
  }

  /**
   * Admin only: Get a list of all access keys in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {AccessKeys}
   */
  async AdminGetAccessKeys(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<AccessKeys> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/access-keys/search`, 'POST', {
      conditions,
      metadata,
      params,
    })
  }

  /**
   * Admin only: Get a count of all access keys in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/access-keys/count`, 'POST', {
      conditions,
      metadata,
    })
  }

  /**
   * Admin only: Get a list of all block headers in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {BlockHeaders}
   */
  async AdminGetBlockHeaders(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<BlockHeaders> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/block-headers/search`, 'POST', {
      conditions,
      metadata,
      params,
    })
  }

  /**
   * Admin only: Get a count of all block headers in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetBlockHeadersCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/block-headers/count`, 'POST', {
      conditions,
      metadata,
    })
  }

  /**
   * Admin only: Get a list of all destinations in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {Destinations}
   */
  async AdminGetDestinations(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Destinations> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/destinations/search`, 'POST', {
      conditions,
      metadata,
      params,
    })
  }

  /**
   * Admin only: Get a count of all destinations in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/destinations/count`, 'POST', {
      conditions,
      metadata,
    })
  }

  /**
   * Admin only: Get a paymail by address
   *
   * @param address string Paymail address (i.e. alias@example.com)
   * @return {PaymailAddress}
   */
  async AdminGetPaymail(address: string): Promise<PaymailAddress> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymail/get`, 'POST', { address })
  }

  /**
   * Admin only: Get a list of all paymails in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {PaymailAddresses}
   */
  async AdminGetPaymails(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<PaymailAddresses> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymails/search`, 'POST', {
      conditions,
      metadata,
      params,
    })
  }

  /**
   * Admin only: Get a count of all paymails in the system, filtered by conditions, metadata and queryParams
   * To get a count of not-deleted paymails, use the condition: { deleted_at: null }
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetPaymailsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymails/count`, 'POST', {
      conditions,
      metadata,
    })
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
    avatar: string
  ): Promise<PaymailAddress> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymail/create`, 'POST', {
      key: rawXPub,
      address,
      public_name,
      avatar,
    })
  }

  /**
   * Admin only: Delete a paymail
   *
   * @param address string Paymail address (ie. example@spv-wallet.org)
   * @return void
   */
  async AdminDeletePaymail(address: string): Promise<void> {
    await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymail/delete`, 'DELETE', { address })
  }

  /**
   * Admin only: Get a list of all transactions in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {Transactions}
   */
  async AdminGetTransactions(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Transactions> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/transactions/search`, 'POST', {
      conditions,
      metadata,
      params,
    })
  }

  /**
   * Admin only: Get a count of all transactions in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/transactions/count`, 'POST', {
      conditions,
      metadata,
    })
  }

  /**
   * Admin only: Get a list of all utxos in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {Utxos}
   */
  async AdminGetUtxos(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Utxos> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/utxos/search`, 'POST', {
      conditions,
      metadata,
      params,
    })
  }

  /**
   * Admin only: Get a count of all utxos in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetUtxosCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/utxos/count`, 'POST', {
      conditions,
      metadata,
    })
  }

  /**
   * Admin only: Get a list of all xpubs in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} params Database query parameters for page, page size and sorting
   * @return {XPubs}
   */
  async AdminGetXPubs(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<XPubs> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/xpubs/search`, 'POST', {
      conditions,
      metadata,
      params,
    })
  }

  /**
   * Admin only: Get a count of all xpubs in the system, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async AdminGetXPubsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/xpubs/count`, 'POST', {
      conditions,
      metadata,
    })
  }

  /**
   * Admin only: Register a new xPub into the SPV Wallet
   *
   * @param {string} rawXPub    XPub string
   * @param {Metadata} metadata Key value object to use to add to the xpub
   * @return {XPub}             The newly registered xpub
   */
  async AdminNewXpub(rawXPub: string, metadata: Metadata): Promise<XPub> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/xpub`, 'POST', {
      key: rawXPub,
      metadata,
    })
  }

  /**
   * Admin only: Record a transaction without any of the normal checks
   *
   * @param {string} hex  Hex string of the transaction
   * @return {Transaction}
   */
  async AdminRecordTransaction(hex: string): Promise<Transaction> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/transactions/record`, 'POST', { hex })
  }

  /**
   * Get information about the xpub from the server of the current user
   *
   * @return {XPub}
   */
  async GetXPub(): Promise<XPub> {
    return await this.doHTTPRequest(`${this.serverUrl}/xpub`)
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
    return await this.doHTTPRequest(`${this.serverUrl}/xpub`, 'PATCH', { metadata })
  }

  /**
   * Get an access key by ID
   *
   * @param {string} id The database ID of the access key
   * @return {AccessKey}
   */
  async GetAccessKey(id: string): Promise<AccessKey> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key?id=${id}`)
  }

  /**
   * Get a list of all access keys for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} queryParams Database query parameters for page, page size and sorting
   * @return {AccessKeys}
   */
  async GetAccessKeys(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<AccessKeys> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || '',
      sort_direction: queryParams?.sort_direction || '',
    })
  }

  /**
   * Get a count of all access keys for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async GetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key/count`, 'POST', {
      conditions,
      metadata,
    })
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
    return await this.doHTTPRequest(`${this.serverUrl}/access-key`, 'POST', { metadata })
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
    return await this.doHTTPRequest(`${this.serverUrl}/access-key?id=${id}`, 'DELETE')
  }

  /**
   * Get a destination of the current user by database ID
   *
   * @param id string Database ID of destination (sha256 hash of locking script)
   * @return {Destination}
   */
  async GetDestinationByID(id: string): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination?id=${id}`)
  }

  /**
   * Get a destination of the current user by locking script
   *
   * @param locking_script string Locking script (script pub key)
   * @return {Destination}
   */
  async GetDestinationByLockingScript(locking_script: string): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination?locking_script=${locking_script}`)
  }

  /**
   * Get a destination of the current user by bitcoin address
   *
   * @param address string Bitcoin address
   * @return {Destination}
   */
  async GetDestinationByAddress(address: string): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination?address=${address}`)
  }

  /**
   * Get a list of all destinations for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} queryParams Database query parameters for page, page size and sorting
   * @return {Destinations}
   */
  async GetDestinations(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Destinations> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || '',
      sort_direction: queryParams?.sort_direction || '',
    })
  }

  /**
   * Get a count of all destinations for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async GetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination/count`, 'POST', {
      conditions,
      metadata,
    })
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
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, 'POST', { metadata })
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
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, 'PATCH', {
      id,
      metadata,
    })
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
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, 'PATCH', {
      locking_script,
      metadata,
    })
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
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, 'PATCH', {
      address,
      metadata,
    })
  }

  /**
   * Get all details of the transaction by the given ID
   *
   * @param {string} txID Transaction ID
   * @return {Transaction}
   */
  async GetTransaction(txID: string): Promise<Transaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction?id=${txID}`, 'GET')
  }

  /**
   * Get a list of all transactions for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} queryParams Database query parameters for page, page size and sorting
   * @return {Transactions}
   */
  async GetTransactions(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Transactions> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || '',
      sort_direction: queryParams?.sort_direction || '',
    })
  }

  /**
   * Get a count of all transactions for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async GetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/count`, 'POST', {
      conditions,
      metadata,
    })
  }

  /**
   * Get all details of the utxo by the given ID
   *
   * @param {string} tx_id Transaction ID of the UTXO
   * @param {number} output_index Index of output within the transaction of the UTXO
   * @return {Utxo}
   */
  async GetUtxo(tx_id: string, output_index: number): Promise<Utxo> {
    return await this.doHTTPRequest(`${this.serverUrl}/utxo?tx_id=${tx_id}&output_index=${output_index}`)
  }

  /**
   * Get a list of all utxos for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @param {QueryParams} queryParams Database query parameters for page, page size and sorting
   * @return {Utxos}
   */
  async GetUtxos(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Utxos> {
    return await this.doHTTPRequest(`${this.serverUrl}/utxo/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || '',
      sort_direction: queryParams?.sort_direction || '',
    })
  }

  /**
   * Get a count of all utxos for the current user, filtered by conditions, metadata and queryParams
   *
   * @param {Conditions} conditions   Key value object to use to filter the documents
   * @param {Metadata} metadata       Key value object to use to filter the documents by the metadata
   * @return {number}
   */
  async GetUtxosCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/utxo/count`, 'POST', {
      conditions,
      metadata,
    })
  }

  /**
   * Create a draft transaction to the recipients given
   *
   * This is a helper function to easily create a new draft transaction to a list of recipients
   *
   * @see {@link SendToRecipients}
   * @param {Recipients} recipients A list of recipients and a satoshi value to send to them
   * @param {Metadata} metadata     Key value object to use to add to the draft transaction
   * @return {DraftTransaction}     Complete draft transaction object from SPV Wallet, all configuration options filled in
   */
  async DraftToRecipients(recipients: Recipients, metadata: Metadata): Promise<DraftTransaction> {
    const transactionConfig: TransactionConfigInput = {
      outputs: recipients,
    }

    return await this.doHTTPRequest(`${this.serverUrl}/transaction`, 'POST', {
      config: transactionConfig,
      metadata,
    })
  }

  /**
   * Create a draft transaction using the given transaction config
   *
   * @param {TransactionConfigInput} transactionConfig Configuration of the new transaction
   * @param {Metadata} metadata                        Key value object to use to add to the draft transaction
   * @return {DraftTransaction}                        Complete draft transaction object from SPV Wallet, all configuration options filled in
   */
  async DraftTransaction(transactionConfig: TransactionConfigInput, metadata: Metadata): Promise<DraftTransaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction`, 'POST', {
      config: transactionConfig,
      metadata,
    })
  }

  /**
   * Helper function to create a draft, sign it and send it to a list of recipients
   *
   * @param {Recipients} recipients A list of recipients and a satoshi value to send to them
   * @param {Metadata} metadata     Key value object to use to add to the (draft) transaction
   * @return {Transaction}          The final transaction object, including the hex of the Bitcoin transaction
   * @example
   * // This function is a shorthand for:
   * const draft = await spvWalletClient.DraftToRecipients(recipients, metadata);
   * const finalized = spvWalletClient.FinalizeTransaction(draft);
   * const tx = await spvWalletClient.RecordTransaction(finalized, draft.id, metadata)
   */
  async SendToRecipients(recipients: Recipients, metadata: Metadata): Promise<Transaction> {
    const draft = await this.DraftToRecipients(recipients, metadata)
    const finalized = this.FinalizeTransaction(draft)
    return this.RecordTransaction(finalized, draft.id, metadata)
  }

  /**
   * Finalize and sign the given draft transaction
   *
   * @param {DraftTransaction} draftTransaction Draft transaction object
   * @return {string} Final transaction hex
   */
  FinalizeTransaction(draftTransaction: DraftTransaction): string {
    if (!this.options?.xPriv) {
      const Err = new Error('cannot sign transaction without an xPriv')
      logger.error(Err)
      throw Err
    }

    const Input = bsv.Transaction.Input
    const xPriv = this.options.xPriv as bsv.HDPrivateKey
    const txDraft = new bsv.Transaction(draftTransaction.hex)

    // sign the inputs
    const privateKeys: bsv.PrivateKey[] = []
    draftTransaction.configuration.inputs?.forEach((input, index) => {
      if (input.destination) {
        const chainKey = xPriv.deriveChild(input.destination.chain)
        const numKey = chainKey.deriveChild(input.destination.num)
        privateKeys.push(numKey.privateKey)

        // small sanity check for the inputs
        if (
          input.transaction_id != txDraft.inputs[index].prevTxId.toString('hex') ||
          input.output_index != txDraft.inputs[index].outputIndex
        ) {
          const Err = new Error('input tx ids do not match in draft and transaction hex')
          logger.error(Err)
          throw Err
        }
      }

      // @todo add support for other types of transaction inputs
      // @ts-ignore Typescript does not understand the way this is setup in bsv lib
      txDraft.inputs[index] = new Input.PublicKeyHash({
        prevTxId: input.transaction_id,
        outputIndex: input.output_index,
        script: new bsv.Script(input.script_pub_key),
        output: new bsv.Transaction.Output({
          script: new bsv.Script(input.script_pub_key),
          satoshis: input.satoshis,
        }),
      })
    })

    txDraft.sign(privateKeys)

    if (!txDraft.verify()) {
      const Err = new Error('transaction verification failed')
      logger.error(Err)
      throw Err
    }
    if (!txDraft.isFullySigned()) {
      const Err = new Error('transaction could not be fully signed')
      logger.error(Err)
      throw Err
    }

    return txDraft.toString()
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
   * @return {Transaction}       The SPV Wallet transaction object
   */
  async RecordTransaction(hex: string, referenceID: string, metadata: Metadata): Promise<Transaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/record`, 'POST', {
      hex,
      reference_id: referenceID,
      metadata,
    })
  }

  /**
   * Updated the metadata object of the transaction given by txID with new keys (does not overwrite the old object)
   *
   * To remove a key from the metadata object, add a key to set with a value of `null`
   *
   * @param {string} txID       The ID of the transaction
   * @param {Metadata} metadata Key value object to use to add to the transaction
   * @return {Transaction}      The complete transaction object, with the new changes
   */
  async UpdateTransactionMetadata(txID: string, metadata: Metadata): Promise<Transaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction`, 'PATCH', {
      id: txID,
      metadata,
    })
  }

  async doHTTPAdminRequest(url: string, method: string = 'GET', payload: any = null): Promise<any> {
    if (!this.adminKey) {
      const Err = new Error('Admin key has not been set. Cannot do admin queries')
      logger.error(Err)
      throw Err
    }

    const res = await this.makeRequest(url, method, payload, this.adminKey)

    if (res.ok) {
      const contentType = res.headers.get('Content-Type')
      if (contentType && contentType.includes('application/json')) {
        return res.json()
      }
      return res.text()
    } else {
      await this.throwRequestError(res)
    }
  }

  async doHTTPRequest(url: string, method: string = 'GET', payload: any = null): Promise<any> {
    const signingKey = this.options.xPriv || this.options.accessKey
    const res = await this.makeRequest(url, method, payload, signingKey)

    if (res.ok) {
      return res.json()
    } else {
      await this.throwRequestError(res)
    }
  }

  async makeRequest(
    url: string,
    method: string,
    payload: any,
    signingKey?: bsv.HDPrivateKey | bsv.PrivateKey
  ): Promise<Response> {
    const json = payload ? JSON.stringify(payload) : null
    let headers: Record<string, string> = { 'content-type': 'application/json' }

    if (this.options.signRequest && signingKey) {
      // @ts-ignore
      headers = setSignature(headers, signingKey, json || '')
    } else if (this.options.xPubString) {
      headers[AuthHeader] = this.options.xPubString
    }

    const req = {
      method,
      headers,
      body: json,
    }

    return global.fetch(url, req)
  }

  async throwRequestError(res: Response) {
    const error = await res.text()
    throw `Status: ${res.status}, Message: ${error}`
  }
}

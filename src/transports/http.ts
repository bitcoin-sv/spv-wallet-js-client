import bsv from 'bsv';
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
  PaymailAddress,
  PaymailAddresses,
  QueryParams,
  Recipients,
  Transaction,
  TransactionConfigInput,
  Transactions,
  TransportService,
  Utxo,
  Utxos,
  XPub,
  XPubs,
} from "../interface";
import { AuthHeader, setSignature } from "../authentication";
import logger from "../logger";
import axios from "axios"
import { AxiosRequestConfig } from "axios"

class TransportHTTP implements TransportService {
  serverUrl: string;
  options: ClientOptions;
  adminKey: bsv.HDPrivateKey | null;

  constructor(serverUrl: string, options: ClientOptions) {
    this.serverUrl = serverUrl;
    this.options = options;
    this.adminKey = null;
  }

  SetAdminKey(adminKey: bsv.HDPrivateKey | string): void {
    if (typeof adminKey === "string") {
      this.options.adminKey = adminKey;
      this.adminKey = bsv.HDPrivateKey.fromString(adminKey);
    } else {
      this.adminKey = adminKey;
      this.options.adminKey = adminKey.toString();
    }
  }

  SetDebug(debug: boolean): void {
    this.options.debug = debug;
  }

  SetSignRequest(signRequest: boolean): void {
    this.options.signRequest = signRequest;
  }

  IsDebug(): boolean {
    return !!this.options.debug;
  }

  IsSignRequest(): boolean {
    return !!this.options.signRequest;
  }

  async AdminGetStatus(): Promise<any> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/status`);
  }

  async AdminGetStats(): Promise<AdminStats> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/stats`);
  }

  async AdminGetAccessKeys(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<AccessKeys> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/access-keys/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  async AdminGetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/access-keys/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  async AdminGetBlockHeaders(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<BlockHeaders> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/block-headers/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  async AdminGetBlockHeadersCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/block-headers/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  async AdminGetDestinations(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Destinations> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/destinations/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  async AdminGetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/destinations/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  async AdminGetPaymail(address: string): Promise<PaymailAddress> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymail/get`, 'POST', { address });
  }

  async AdminGetPaymails(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<PaymailAddresses> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymails/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  async AdminGetPaymailsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymails/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  async AdminCreatePaymail(xpub: string, address: string, public_name: string, avatar: string): Promise<PaymailAddress> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymail/create`, 'POST', {
      xpub,
      address,
      public_name,
      avatar,
    });
  }

  async AdminDeletePaymail(address: string): Promise<PaymailAddress> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymail/delete`, 'DELETE', { address });
  }

  async AdminGetTransactions(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Transactions> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/transactions/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  async AdminGetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/transactions/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  async AdminGetUtxos(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Utxos> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/utxos/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  async AdminGetUtxosCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/utxos/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  async AdminGetXPubs(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<XPubs> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/xpubs/search`, 'POST', {
      conditions,
      metadata,
      params,
    });
  }

  async AdminGetXPubsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/xpubs/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Record a new transaction into the database as the admin
   * @param hex string Hex string of the transaction
   * @returns {Transaction}
   */
  async AdminRecordTransaction(hex: string): Promise<Transaction> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/transactions/record`, 'POST', { hex });
  }

  /**
   * Get xpub info
   * @returns XPub
   */
  async GetXPub(): Promise<XPub> {
    return await this.doHTTPRequest(`${this.serverUrl}/xpub`);
  }

  /**
   * Update Xpub metadata
   *
   * Admin key should be set to be able to use this method
   * @returns XPub
   */
  async UpdateXPubMetadata(metadata: Metadata): Promise<XPub> {
    return await this.doHTTPRequest(`${this.serverUrl}/xpub`, 'PATCH', { metadata });
  }

  /**
   * Get access keys
   * @returns AccessKeys
   */
  async GetAccessKey(id: string): Promise<AccessKey> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key?id=${id}`);
  }

  /**
   * Get access keys
   * @param conditions Conditions A key value map to filter the access keys on
   * @param metadata Metadata The metadata to filter on
   * @param queryParams Query parameters for the database query (page, pageSize, orderBy, sortBy)
   * @returns AccessKeys
   */
  async GetAccessKeys(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<AccessKeys> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || "",
      sort_direction: queryParams?.sort_direction || "",
    });
  }

  /**
   * Get access keys count
   * @param conditions Conditions A key value map to filter the access keys on
   * @param metadata Metadata The metadata to filter on
   * @returns number
   */
  async GetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Revoke an access key
   * @returns AccessKey
   */
  async RevokeAccessKey(id: string): Promise<AccessKey> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key?id=${id}`, 'DELETE');
  }

  /**
   * Get access keys
   * @returns AccessKeys
   */
  async CreateAccessKey(metadata: Metadata): Promise<AccessKey> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key`, 'POST', { metadata });
  }

  /**
   * Get information about an existing destination
   * @returns Destination
   */
  async GetDestinationByID(id: string): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination?id=${id}`);
  }

  /**
   * Get information about an existing destination by its locking script
   * @returns Destination
   */
  async GetDestinationByLockingScript(locking_script: string): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination?locking_script=${locking_script}`);
  }

  /**
   * Get information about an existing destination by its address
   * @returns Destination
   */
  async GetDestinationByAddress(address: string): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination?address=${address}`);
  }

  /**
   * Get a list of destinations
   * @param conditions Conditions A key value map to filter the destinations on
   * @param metadata Metadata The metadata to filter on
   * @param queryParams Query parameters for the database query (page, pageSize, orderBy, sortBy)
   * @returns {Destination}
   */
  async GetDestinations(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Destinations> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || "",
      sort_direction: queryParams?.sort_direction || "",
    });
  }

  /**
   * Get destinations count
   * @param conditions Conditions A key value map to filter the destinations on
   * @param metadata Metadata The metadata to filter on
   * @returns number
   */
  async GetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Get a new destination to receive funds on
   * @param metadata Metadata The metadata to record on the destination
   * @returns Destination
   */
  async NewDestination(metadata: Metadata): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, 'POST', { metadata });
  }

  /**
   * Update Update destination metadata by id
   * @returns Destination
   */
  async UpdateDestinationMetadataByID(id: string, metadata: Metadata): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, 'PATCH', {
      id,
      metadata,
    });
  }

  /**
   * Update Update destination metadata by address
   * @returns Destination
   */
  async UpdateDestinationMetadataByAddress(address: string, metadata: Metadata): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, 'PATCH', {
      address,
      metadata,
    });
  }

  /**
   * Update Update destination metadata by lockingScript
   * @returns Destination
   */
  async UpdateDestinationMetadataByLockingScript(lockingScript: string, metadata: Metadata): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, 'PATCH', {
      locking_script: lockingScript,
      metadata
    });
  }

  /**
   * Register a new paymail
   *
   * Admin key should be set before use this method
   *
   * @param {string} key - The rawXPubKey
   * @param {string} address - The full paymail address
   * @param {string} [publicName] - The public name (optional)
   * @param {string} [avatar] - The avatar (optional)
   * @param {Metadata} [metadata] - The metadata to record on the destination (optional)
   * @returns {void}
   */
  async NewPaymail(
    key: string,
    address: string,
    publicName?: string,
    avatar?: string,
    metadata?: Metadata
  ): Promise<void> {
    await this.doHTTPRequest(`${this.serverUrl}/paymail`, "POST", {
      key,
      address,
      public_name: publicName,
      avatar,
      metadata,
    });
  }

  /**
   * Delete paymail
   *
   * Admin key should be set before use this method
   *
   * @param {string} address - The full paymail address
   * @returns {void}
   */
  async DeletePaymail(address: string): Promise<void> {
    await this.doHTTPRequest(`${this.serverUrl}/paymail`, "DELETE", { address });
  }

  /**
   * Get a transaction by ID
   * @param txID string Transaction ID to retrieve
   * @returns Transaction
   */
  async GetTransaction(txID: string): Promise<Transaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction?id=${txID}`, 'GET');
  }

  /**
   * Get a list of transactions
   * @param conditions Conditions A key value map to filter the transactions on
   * @param metadata Metadata The metadata to filter on
   * @param queryParams Query parameters for the database query (page, pageSize, orderBy, sortBy)
   * @returns {Transaction}
   */
  async GetTransactions(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Transactions> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || "",
      sort_direction: queryParams?.sort_direction || "",
    });
  }

  /**
   * Get transactions count
   * @param conditions Conditions A key value map to filter the transactions on
   * @param metadata Metadata The metadata to filter on
   * @returns number
   */
  async GetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Get an utxo by ID
   * @param tx_id string Transaction ID of UTXO to retrieve
   * @param output_index int Output index of Utxo to retrieve
   * @returns Utxo
   */
  async GetUtxo(tx_id: string, output_index: number): Promise<Utxo> {
    return await this.doHTTPRequest(`${this.serverUrl}/utxo?tx_id=${tx_id}&output_index=${output_index}`, 'GET');
  }

  /**
   * Get a list of utxos
   * @param conditions Conditions A key value map to filter the utxos on
   * @param metadata Metadata The metadata to filter on
   * @param queryParams Query parameters for the database query (page, pageSize, orderBy, sortBy)
   * @returns {Utxos}
   */
  async GetUtxos(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Utxos> {
    return await this.doHTTPRequest(`${this.serverUrl}/utxo/search`, 'POST', {
      conditions,
      metadata,
      page: queryParams?.page || 0,
      page_size: queryParams?.page_size || 0,
      order_by_field: queryParams?.order_by_field || "",
      sort_direction: queryParams?.sort_direction || "",
    });
  }

  /**
   * Get utxos count
   * @param conditions Conditions A key value map to filter the utxos on
   * @param metadata Metadata The metadata to filter on
   * @returns number
   */
  async GetUtxosCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/utxo/count`, 'POST', {
      conditions,
      metadata,
    });
  }

  /**
   * Initiate a new draft transaction to the given recipients
   * @param recipients Recipients The recipients of the transaction
   * @param metadata Metadata The metadata to record on the draft transaction
   * @returns {DraftTransaction}
   */
  async DraftToRecipients(recipients: Recipients, metadata: Metadata): Promise<DraftTransaction> {
    const transactionConfig: TransactionConfigInput = {
      outputs: recipients
    }

    return await this.doHTTPRequest(`${this.serverUrl}/transaction`, 'POST', {
      config: transactionConfig,
      metadata,
    });
  }

  /**
   * Initiate a new draft transaction using the given configuration
   * @param transactionConfig TransactionConfig The config to use for the new draft transaction
   * @param metadata Metadata The metadata to record on the draft transaction
   * @returns DraftTransaction
   */
  async DraftTransaction(transactionConfig: TransactionConfigInput, metadata: Metadata): Promise<DraftTransaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction`, 'POST', {
      config: transactionConfig,
      metadata,
    });
  }

  /**
   * Record a new transaction into the database
   * @param hex string Hex string of the transaction
   * @param referenceID string The reference ID of the draft transaction used to create the transaction
   * @param metadata Metadata The metadata to record on the transaction
   * @returns {Transaction}
   */
  async RecordTransaction(hex: string, referenceID: string, metadata: Metadata): Promise<Transaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/record`, 'POST', {
      hex,
      reference_id: referenceID,
      metadata,

    });
  }

  /**
   * Update Update transaction metadata
   * @returns Transaction
   */
  async UpdateTransactionMetadata(txID: string, metadata: Metadata): Promise<Transaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction`, 'PATCH', {
      id: txID,
      metadata
    });
  }

  /**
   * Register a new xPub in the database (requires admin key)
   * @param rawXPub string The raw string version of the XPub (xpub.....)
   * @param metadata Metadata The metadata to record on the xPub
   * @returns {XPub}
   */
  async RegisterXpub(rawXPub: string, metadata: Metadata): Promise<XPub> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/xpub`, 'POST', {
      key: rawXPub,
      metadata
    });
  }

  async doHTTPAdminRequest(url: string, method: string = 'GET', payload: any = null): Promise<any> {
    if (!this.adminKey) {
      const Err = new Error("Admin key has not been set. Cannot do admin queries");
      logger.error(Err)
      throw Err
    }

    try {
      return await this.makeRequest(url, method, payload, this.adminKey)
    } catch (error: any) {
      this.handleRequestError(error)
    }
  }

  async doHTTPRequest(url: string, method: string = 'GET', payload: any = null): Promise<any> {
    const signingKey = this.options.xPriv || this.options.accessKey;

    try {
      return await this.makeRequest(url, method, payload, signingKey)
    } catch (error: any) {
      this.handleRequestError(error)
    }
  }

  async makeRequest(url: string, method: string, payload: any, signingKey: any): Promise<any> {
    let headers: any = {
      'content-type': 'application/json'
    }

    const payloadJson = JSON.stringify(payload)

    if (this.options.signRequest && signingKey) {
      // @ts-ignore
      headers = setSignature(headers, signingKey, payloadJson || "");
    } else {
      headers[AuthHeader] = this.options.xPubString;
    }

    // 
    const req: AxiosRequestConfig = {
      method,
      headers,
      data: payloadJson
    };

    const res = await axios(url, req)
    return res.data
  }

  handleRequestError(error: any): any {
    let errMsg: string

    if (error.response) {
      const { status, data } = error.response
      let msg: string = ""

      if (typeof data === 'string') {
        msg = data
      } else if (data) {
        msg = data.message
      }
      errMsg = `Status: ${status}, Message: ${msg}`;
    }
    else {
      errMsg = `Status: ${error.status}, Message: ${error.message}`;
    }

    console.error(errMsg)
    throw errMsg
  }
}

export default TransportHTTP

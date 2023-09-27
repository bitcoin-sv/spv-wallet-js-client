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
  QueryParams,
  PaymailAddress,
  PaymailAddresses,
  Recipients,
  Transaction,
  TransactionConfigInput,
  Transactions,
  TransportService,
  Utxos,
  XPub,
  XPubs,
  Utxo,
} from "../interface";
import { AuthHeader, setSignature } from "../authentication";

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
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/status`, {});
  }

  async AdminGetStats(): Promise<AdminStats> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/stats`, {});
  }

  async AdminGetAccessKeys(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<AccessKeys> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/access-keys/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        params,
      })
    });
  }

  async AdminGetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/access-keys/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      })
    });
  }

  async AdminGetBlockHeaders(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<BlockHeaders> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/block-headers/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        params,
      })
    });
  }

  async AdminGetBlockHeadersCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/block-headers/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      })
    });
  }

  async AdminGetDestinations(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Destinations> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/destinations/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        params,
      })
    });
  }

  async AdminGetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/destinations/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      })
    });
  }

  async AdminGetPaymail(address: string): Promise<PaymailAddress> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymail/get`, {
      method: 'POST',
      body: JSON.stringify({
        address,
      })
    });
  }

  async AdminGetPaymails(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<PaymailAddresses> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymails/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        params,
      })
    });
  }

  async AdminGetPaymailsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymails/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      })
    });
  }

  async AdminCreatePaymail(xpub: string, address: string, public_name: string, avatar: string): Promise<PaymailAddress> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymail/create`, {
      method: 'POST',
      body: JSON.stringify({
        xpub,
        address,
        public_name,
        avatar,
      })
    });
  }

  async AdminDeletePaymail(address: string): Promise<PaymailAddress> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/paymail/delete`, {
      method: 'DELETE',
      body: JSON.stringify({
        address,
      })
    });
  }

  async AdminGetTransactions(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Transactions> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/transactions/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        params,
      })
    });
  }

  async AdminGetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/transactions/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      })
    });
  }

  async AdminGetUtxos(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Utxos> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/utxos/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        params,
      })
    });
  }

  async AdminGetUtxosCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/utxos/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      })
    });
  }

  async AdminGetXPubs(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<XPubs> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/xpubs/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        params,
      })
    });
  }

  async AdminGetXPubsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/xpubs/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      })
    });
  }

  /**
   * Record a new transaction into the database as the admin
   * @param hex string Hex string of the transaction
   * @returns {Transaction}
   */
  async AdminRecordTransaction(hex: string): Promise<Transaction> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/admin/transactions/record`, {
      method: 'POST',
      body: JSON.stringify({
        hex,
      })
    });
  }

  /**
   * Get xpub info
   * @returns XPub
   */
  async GetXPub(): Promise<XPub> {
    return await this.doHTTPRequest(`${this.serverUrl}/xpub`, {});
  }

  /**
   * Update Xpub metadata
   * @returns XPub
   */
  async UpdateXPubMetadata(metadata: Metadata): Promise<XPub> {
    return await this.doHTTPRequest(`${this.serverUrl}/xpub`, {
      method: 'PATCH',
      body: JSON.stringify({
        metadata,
      }),
    });
  }

  /**
   * Get access keys
   * @returns AccessKeys
   */
  async GetAccessKey(id: string): Promise<AccessKey> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key?id=${id}`, {});
  }

  /**
   * Get access keys
   * @param conditions Conditions A key value map to filter the access keys on
   * @param metadata Metadata The metadata to filter on
   * @param queryParams Query parameters for the database query (page, pageSize, orderBy, sortBy)
   * @returns AccessKeys
   */
  async GetAccessKeys(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<AccessKeys> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        page: queryParams?.page || 0,
        page_size: queryParams?.page_size || 0,
        order_by_field: queryParams?.order_by_field || "",
        sort_direction: queryParams?.sort_direction || "",
      }),
    });
  }

  /**
   * Get access keys count
   * @param conditions Conditions A key value map to filter the access keys on
   * @param metadata Metadata The metadata to filter on
   * @returns number
   */
  async GetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      }),
    });
  }

  /**
   * Revoke an access key
   * @returns AccessKey
   */
  async RevokeAccessKey(id: string): Promise<AccessKey> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key?id=${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get access keys
   * @returns AccessKeys
   */
  async CreateAccessKey(metadata: Metadata): Promise<AccessKey> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key`, {
      method: 'POST',
      body: JSON.stringify({
        metadata,
      }),
    });
  }

  /**
   * Get information about an existing destination
   * @returns Destination
   */
  async GetDestinationByID(id: string): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination?id=${id}`, {});
  }

  /**
   * Get information about an existing destination by its locking script
   * @returns Destination
   */
  async GetDestinationByLockingScript(locking_script: string): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination?locking_script=${locking_script}`, {});
  }

  /**
   * Get information about an existing destination by its address
   * @returns Destination
   */
  async GetDestinationByAddress(address: string): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination?address=${address}`, {});
  }

  /**
   * Get a list of destinations
   * @param conditions Conditions A key value map to filter the destinations on
   * @param metadata Metadata The metadata to filter on
   * @param queryParams Query parameters for the database query (page, pageSize, orderBy, sortBy)
   * @returns {Destination}
   */
  async GetDestinations(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Destinations> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        page: queryParams?.page || 0,
        page_size: queryParams?.page_size || 0,
        order_by_field: queryParams?.order_by_field || "",
        sort_direction: queryParams?.sort_direction || "",
      })
    });
  }

  /**
   * Get destinations count
   * @param conditions Conditions A key value map to filter the destinations on
   * @param metadata Metadata The metadata to filter on
   * @returns number
   */
  async GetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      }),
    });
  }

  /**
   * Get a new destination to receive funds on
   * @param metadata Metadata The metadata to record on the destination
   * @returns Destination
   */
  async NewDestination(metadata: Metadata): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, {
      method: 'POST',
      body: JSON.stringify({
        metadata,
      })
    });
  }

  /**
   * Update Update destination metadata by id
   * @returns Destination
   */
  async UpdateDestinationMetadataByID(id: string, metadata: Metadata): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, {
      method: 'PATCH',
      body: JSON.stringify({
        id,
        metadata,
      }),
    });
  }

  /**
   * Update Update destination metadata by address
   * @returns Destination
   */
  async UpdateDestinationMetadataByAddress(address: string, metadata: Metadata): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, {
      method: 'PATCH',
      body: JSON.stringify({
        address,
        metadata,
      }),
    });
  }

  /**
   * Update Update destination metadata by lockingScript
   * @returns Destination
   */
  async UpdateDestinationMetadataByLockingScript(lockingScript: string, metadata: Metadata): Promise<Destination> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination`, {
      method: 'PATCH',
      body: JSON.stringify({
        lockingScript,
        metadata,
      }),
    });
  }

  /**
   * Register a new paymail
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
    await this.doHTTPRequest(`${this.serverUrl}/paymail`, {
      method: "POST",
      body: JSON.stringify({
        key,
        address,
        public_name: publicName,
        avatar,
        metadata,
      }),
    });
  }

  /**
   * Delete paymail
   * @param {string} address - The full paymail address
   * @returns {void}
   */
  async DeletePaymail(address: string): Promise<void> {
    await this.doHTTPRequest(`${this.serverUrl}/paymail`, {
      method: "DELETE",
      body: JSON.stringify({ address }),
    });
  }
  
  /**
   * Get a transaction by ID
   * @param txID string Transaction ID to retrieve
   * @returns Transaction
   */
  async GetTransaction(txID: string): Promise<Transaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction?id=${txID}`, {});
  }

  /**
   * Get a list of transactions
   * @param conditions Conditions A key value map to filter the transactions on
   * @param metadata Metadata The metadata to filter on
   * @param queryParams Query parameters for the database query (page, pageSize, orderBy, sortBy)
   * @returns {Transaction}
   */
  async GetTransactions(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Transactions> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        page: queryParams?.page || 0,
        page_size: queryParams?.page_size || 0,
        order_by_field: queryParams?.order_by_field || "",
        sort_direction: queryParams?.sort_direction || "",
      })
    });
  }

  /**
   * Get transactions count
   * @param conditions Conditions A key value map to filter the transactions on
   * @param metadata Metadata The metadata to filter on
   * @returns number
   */
  async GetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      }),
    });
  }

  /**
   * Get a utxo by ID
   * @param tx_id string Transaction ID of UTXO to retrieve
   * @param output_index int Output index of Utxo to retrieve
   * @returns Utxo
   */
  async GetUtxo(tx_id: string, output_index: number): Promise<Utxo> {
    return await this.doHTTPRequest(`${this.serverUrl}/utxo?tx_id=${tx_id}&output_index=${output_index}`, {});
  }

  /**
   * Get a list of utxos
   * @param conditions Conditions A key value map to filter the utxos on
   * @param metadata Metadata The metadata to filter on
   * @param queryParams Query parameters for the database query (page, pageSize, orderBy, sortBy)
   * @returns {Utxos}
   */
  async GetUtxos(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Utxos> {
    return await this.doHTTPRequest(`${this.serverUrl}/utxo/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
        page: queryParams?.page || 0,
        page_size: queryParams?.page_size || 0,
        order_by_field: queryParams?.order_by_field || "",
        sort_direction: queryParams?.sort_direction || "",
      })
    });
  }

  /**
   * Get utxos count
   * @param conditions Conditions A key value map to filter the utxos on
   * @param metadata Metadata The metadata to filter on
   * @returns number
   */
  async GetUtxosCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.doHTTPRequest(`${this.serverUrl}/utxo/count`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      }),
    });
  }

  /**
   * Remove the reservation on the utxos for the given draft ID
   * @param referenceID string The reference ID of the draft transaction used to create the transaction
   * @returns void
   */
  async UnreserveUtxos(referenceID: string): Promise<void> {
    return await this.doHTTPRequest(`${this.serverUrl}/utxo/unreserve`, {
      method: 'PATCH',
      body: JSON.stringify({
        reference_id: referenceID,
      }),
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

    return await this.doHTTPRequest(`${this.serverUrl}/transaction`, {
      method: 'POST',
      body: JSON.stringify({
        config: transactionConfig,
        metadata,
      })
    });
  }

  /**
   * Initiate a new draft transaction using the given configuration
   * @param transactionConfig TransactionConfig The config to use for the new draft transaction
   * @param metadata Metadata The metadata to record on the draft transaction
   * @returns DraftTransaction
   */
  async DraftTransaction(transactionConfig: TransactionConfigInput, metadata: Metadata): Promise<DraftTransaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction`, {
      method: 'POST',
      body: JSON.stringify({
        config: transactionConfig,
        metadata,
      })
    });
  }

  /**
   * Cancel a draft transaction and release the utxos
   *
   * @param referenceID string The reference ID of the draft transaction used to create the transaction
   * @returns void
   */
  async CancelDraftTransaction(referenceID: string): Promise<void> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/cancel`, {
      method: 'POST',
      body: JSON.stringify({
        reference_id: referenceID,
      })
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
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/record`, {
      method: 'POST',
      body: JSON.stringify({
        hex,
        reference_id: referenceID,
        metadata,
      })
    });
  }

  /**
   * Update Update transaction metadata
   * @returns Transaction
   */
  async UpdateTransactionMetadata(txID: string, metadata: Metadata): Promise<Transaction> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction`, {
      method: 'PATCH',
      body: JSON.stringify({
        id: txID,
        metadata,
      }),
    });
  }

  /**
   * Register a new xPub in the database (requires admin key)
   * @param rawXPub string The raw string version of the XPub (xpub.....)
   * @param metadata Metadata The metadata to record on the xPub
   * @returns {XPub}
   */
  async RegisterXpub(rawXPub: string, metadata: Metadata): Promise<XPub> {
    return await this.doHTTPAdminRequest(`${this.serverUrl}/xpub`, {
      method: 'POST',
      body: JSON.stringify({
        key: rawXPub,
        metadata,
      })
    });
  }

  /**
   * Register a new xPub in the database (requires admin key)
   * @param rawXPub string The raw string version of the XPub (xpub.....)
   * @param token string The server token that can be used to register the xpub
   * @param metadata Metadata The metadata to record on the xPub
   * @returns {XPub}
   */
  async RegisterXpubWithToken(rawXPub: string, token: string, metadata: Metadata): Promise<XPub> {
    return await this.doHTTPRequest(`${this.serverUrl}/xpub/with-token`, {
      method: 'POST',
      body: JSON.stringify({
        key: rawXPub,
        token,
        metadata,
      })
    });
  }

  async doHTTPAdminRequest(url: string, options: any) {
    if (!this.adminKey) {
      throw new Error("Admin key has not been set. Cannot do admin queries");
    }
    return this._doHTTPRequest(url, options, this.adminKey)
  }

  async doHTTPRequest(url: string, options: any) {
    const signingKey = this.options.xPriv || this.options.accessKey;
    return this._doHTTPRequest(url, options, signingKey)
  }

  async _doHTTPRequest(url: string, options: any, signingKey: any) {
    let headers = {...options.headers,
      'content-type': 'application/json'
    }

    if (this.options.signRequest && signingKey) {
      // @ts-ignore
      headers = setSignature(headers, signingKey, options.body || "");
    } else {
      headers[AuthHeader] = this.options.xPubString;
    }

    const httpOptions = {...options,
      headers,
    };

    const response = await global.fetch(url, httpOptions);

    if (response.status >= 400) {
      throw new Error(response.statusText);
    }

    return response.json();
  }
}

export default TransportHTTP

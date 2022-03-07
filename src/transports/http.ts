import bsv from 'bsv';
import {
  AccessKey,
  AccessKeys,
  ClientOptions,
  Conditions,
  Destination, Destinations,
  DraftTransaction,
  Metadata,
  Recipients,
  Transaction,
  TransactionConfig, TransactionConfigInput, Transactions,
  TransportService, XPub
} from "../interface";
import {setSignature} from "../authentication";

class TransportHTTP implements TransportService {
  serverUrl: string;
  options: ClientOptions;

  constructor(serverUrl: string, options: ClientOptions) {
    this.serverUrl = serverUrl;
    this.options = options;
  }

  SetAdminKey(adminKey: string): void {
    this.options.adminKey = adminKey;
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

  /**
   * Get xpub info
   * @returns XPub
   */
  async GetXPub(): Promise<XPub> {
    return await this.doHTTPRequest(`${this.serverUrl}/xpub`, {});
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
   * @returns AccessKeys
   */
  async GetAccessKeys(metadata: Metadata): Promise<AccessKeys> {
    return await this.doHTTPRequest(`${this.serverUrl}/access-key/search`, {
      method: 'POST',
      body: JSON.stringify({
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
   * @param metadata Metadata The metadata to filter on
   * @constructor
   */
  async GetDestinations(metadata: Metadata): Promise<Destinations> {
    return await this.doHTTPRequest(`${this.serverUrl}/destination/search`, {
      method: 'POST',
      body: JSON.stringify({
        metadata,
      })
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
   * @constructor
   */
  async GetTransactions(conditions: Conditions, metadata: Metadata): Promise<Transactions> {
    return await this.doHTTPRequest(`${this.serverUrl}/transaction/search`, {
      method: 'POST',
      body: JSON.stringify({
        conditions,
        metadata,
      })
    });
  }

  /**
   * Initiate a new draft transaction to the given recipients
   * @param recipients Recipients The recipients of the transaction
   * @param metadata Metadata The metadata to record on the draft transaction
   * @constructor
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
   * Record a new transaction into the database
   * @param hex string Hex string of the transaction
   * @param referenceID string The reference ID of the draft transaction used to create the transaction
   * @param metadata Metadata The metadata to record on the transaction
   * @constructor
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
   * Register a new xPub in the database (requires admin key)
   * @param rawXPub string The raw string version of the XPub (xpub.....)
   * @param metadata Metadata The metadata to record on the xPub
   * @constructor
   */
  async RegisterXpub(rawXPub: string, metadata: Metadata): Promise<XPub> {
    return await this.doHTTPRequest(`${this.serverUrl}/xpub`, {
      method: 'POST',
      body: JSON.stringify({
        key: rawXPub,
        metadata,
      })
    });
  }

  async doHTTPRequest(url: string, options: any) {
    let headers = {...options.headers,
      'content-type': 'application/json',
      'auth_xpub': this.options.xPubString,
    }

    if (this.options.signRequest && (this.options.xPriv || this.options.accessKey)) {
      // @ts-ignore
      headers = setSignature(headers, this.options.xPriv || this.options.accessKey, options.body || "");
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

import bsv from 'bsv';

export interface Client {
  server_url: string;
  httpTransport: TransportService;
}

/**
 * Transport type to use to communicate with teh backend server
 *
 * The server will need to have the transport type enabled
 */
// export type TransportType = "http";

/**
 * Database query key value conditions to filter data on
 *
 * @example
 * const conditions = {
 *   xpub_id: "701fc247df75a8dd1572e888387b68d634366dbfb2a8555fb5cb9e7ea6975fca",
 *   address: "1nLj5puSYwWWm3DhHfgXXCY4XbmX9gZEk"
 * }
 */
export interface Conditions {
  /**
   * Key value element
   */
  [key: string]: any
}

/**
 * Database key value conditions to filter on the metadata object
 *
 * @example
 * const metadata = {
 *   buxVersion: "v0.1.3",
 *   someKey: "some value"
 * }
 */
export interface Metadata {
  /**
   * Key value element
   */
  [key: string]: any
}

/**
 * Xpub interface
 *
 * @example
 * {
    "_id": "7406ab7d9e781685d6d0ceb319b84b332ff1b773ff0bbce1671d843d50c9532a",
    "created_at": new Date(1645796112916),
    "metadata": [
      {
        "k": "user_agent",
        "v": "BuxClient v1.0.0"
      },
    ],
    "current_balance": 99848517,
    "next_internal_num": 100,
    "next_external_num": 229
  }
 */
export interface XPub {
  /**
   * metadata object
   */
  metadata?: Metadata;
  /**
   * xpub id
   */
  id: string;
  /**
   * Current balance in sats of the xpub
   */
  current_balance: number;
  /**
   * Next internal (change address) number to use for a new destination
   *
   * NOTE: Do not use this to create new destinations, always let Bux create the destination
   */
  next_internal_num: number;
  /**
   * Next external number to use for a new destination
   *
   * NOTE: Do not use this to create new destinations, always let Bux create the destination
   */
  next_external_num: number;
  /**
   * Date when this object was created
   */
  created_at?: Date;
  /**
   * Date when this object was last updated
   */
  updated_at?: Date;
  /**
   * If this object has been deleted, this date will be set
   */
  deleted_at?: Date;
}

/**
 * Array of xpubs
 * @see {@link XPub}
 */
export interface XPubs extends Array<XPub> {}

/**
 * Access key interface.
 *
 * This does not include the private access key, which is only given out on creation
 */
export interface AccessKey {
  /**
   * ID of the access key
   */
  id: string;
  /**
   * Xpub ID this access key was created for
   */
  xpub_id: string;
  /**
   * Private access key, only given out on creation
   */
  key?: string;
  /**
   * Metadata object
   */
  metadata?: Metadata;
  /**
   * Date when this object was created
   */
  created_at: Date;
  /**
   * Date when this object was last updated
   */
  updated_at?: Date;
  /**
   * If this object has been deleted, this date will be set
   */
  deleted_at?: Date;
  /**
   * If this access key has been revoked, this date will be set and the access key will not work anymore
   */
  revoked_at?: Date;
}

/**
 * Array of access keys
 * @see {@link AccessKey}
 */
export interface AccessKeys extends Array<AccessKey> {}

/**
 * Destination interface
 */
export interface Destination {
  /**
   * ID of the destination
   */
  id: string;
  /**
   * Xpub ID this destination was created for
   */
  xpub_id: string;
  /**
   * Locking script (script pub key) of the destination
   */
  locking_script: string;
  /**
   * Type of destination: pubkeyhash, nulldata (op return), multisig, nonstandard, scripthash (deprecated p2sh), metanet, token_stas
   */
  type: string;
  /**
   * Chain num (0 = external, 1 = internal)
   */
  chain: number;
  /**
   * Num used for the derivation of the destination
   */
  num: number;
  /**
   * Address of the destination, empty of not p2pkh
   */
  address: string;
  /**
   * ID of the draft transaction associated with this destination
   */
  draft_id: string;
  /**
   * Metadata object
   */
  metadata: Metadata;
  /**
   * Date when this object was created
   */
  created_at: Date;
  /**
   * Date when this object was last updated
   */
  updated_at?: Date;
  /**
   * If this object has been deleted, this date will be set
   */
  deleted_at?: Date;
}

/**
 * Array of destinations
 * @see {@link Destination}
 */
export interface Destinations extends Array<Destination> {}

/**
 * Block header
 */
export interface BlockHeader {
  id: string;
  height: number;
  time: number;
  nonce: number;
  version: number;
  hash_previous_block: string;
  hash_merkle_root: string;
  bits: string;
  synced: string | null;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

/**
 * Array og block headers
 * @see {@link BlockHeader}
 */
export interface BlockHeaders extends Array<BlockHeader> {}

/**
 * Transaction
 */
export interface Transaction {
  id: string;
  hex: string;
  block_hash: string;
  block_height: number;
  fee: number;
  number_of_inputs: number;
  number_of_outputs: number;
  output_value: number;
  total_value: number;
  metadata?: Metadata;
  direction: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}


/**
 * Array of transactions
 * @see {@link Transaction}
 */
export interface Transactions extends Array<Transaction> {}

/**
 * MAP protocol definition
 */
export interface MapProtocol {
  /**
   * App name
   */
  app?: string;
  /**
   * Type of MAP action
   */
  type?: string;
  /**
   * MAP key value pairs
   */
  keys?: { [key: string]: any };
}

/**
 * OP_RETURN data, only one of the attributes should be set
 */
export interface OpReturn {
  /**
   * HEX string of OP_RETURN
   */
  hex?: string;
  /**
   * Array of parts of the OP_RETURN in hex
   */
  hex_parts?: string[];
  /**
   * MAP protocol definition
   * @see {@link Map}
   */
  map?: MapProtocol;
  /**
   * String parts array
   */
  string_parts?: string[];
}

/**
 * Recipient interface
 */
export interface Recipient {
  to: string;
  satoshis: number;
  op_return?: OpReturn;
}

/**
 * Array of Recipients
 * @see {@link Recipient}
 */
export interface Recipients extends Array<Recipient> {}

/**
 * Fee unit to use when calculating the fee for the transaction (satoshis per byte)
 */
export interface FeeUnit {
  /**
   * Satoshis
   */
  satoshis: number;
  /**
   * Bytes
   */
  bytes: number;
}

/**
 * A record pointing to a UTXO by transaction ID and output index
 */
export interface UtxoPointer {
  /**
   * Transaction ID
   */
  transaction_id: string;
  /**
   * Output index
   */
  output_index: number;
}

/**
 * Transaction used as an input in a draft transaction
 */
export interface TransactionInput {
  created_at?: Date;
  updated_at?: Date;
  metadata?: Metadata;
  deleted_at?: Date;
  id?: string;
  transaction_id: string;
  xpub_id?: string;
  output_index: number;
  satoshis: number;
  script_pub_key: string;
  type: string;
  draft_id?: string;
  reserved_at?: Date;
  spending_tx_id?: string;
  destination?: Destination;
}

/**
 * Paymail address interface
 */
export interface PaymailAddress {
  id: string;
  xpub_id: string;
  alias: string;
  domain: string;
  public_name: string;
  avatar: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

/**
 * Array of Paymail addresses
 * @see {@link PaymailAddress}
 */
export interface PaymailAddresses extends Array<PaymailAddress> {}

/**
 * Paymail p2p record for communicating with other p2p providers
 */
export interface PaymailP4 {
  alias: string;
  domain: string;
  from_paymail?: string;
  note?: string;
  pub_key?: string;
  receive_endpoint?: string;
  reference_id?: string;
  resolution_type: string;
}

/**
 * Script output of a transaction
 */
export interface ScriptOutput {
  address?: string;
  satoshis?: number;
  script: string;
  script_type?: string;
}

/**
 * Transaction output record in a draft transaction
 */
export interface TransactionOutput {
  paymail_p4?: PaymailP4;
  satoshis?: number;
  script?: string;
  scripts?: ScriptOutput[];
  to?: string;
  op_return?: OpReturn;
}

/**
 * Configuration for syncing transaction on-chain
 */
export interface SyncConfig {
  broadcast: boolean;
  broadcast_instant: boolean;
  sync_on_chain: boolean;
  paymail_p2p: boolean;
}

/**
 * Configuration for a new transaction
 */
export interface TransactionConfig {
  change_destinations?: Destination[];
  change_destinations_strategy?: ChangeStrategy;
  change_minimum_satoshis?: number;
  change_number_of_destinations?: number;
  change_satoshis?: number;
  expires_in?: number;
  fee?: number;
  fee_unit?: FeeUnit;
  from_utxos?: UtxoPointer[];
  include_utxos?: UtxoPointer[];
  inputs?: TransactionInput[];
  miner?: string;
  outputs: TransactionOutput[];
  send_all_to?: string;
  sync?: SyncConfig;
}

/**
 * Transaction input in a new transaction
 */
export interface TransactionConfigInput {
  change_destinations?: Destination[];
  change_destinations_strategy?: ChangeStrategy;
  change_minimum_satoshis?: number;
  change_number_of_destinations?: number;
  change_satoshis?: number;
  expires_in?: number;
  fee?: number;
  fee_unit?: FeeUnit;
  from_utxos?: UtxoPointer[];
  miner?: string;
  outputs: TransactionOutput[];
  send_all_to?: string;
  sync?: SyncConfig;
}

/**
 * Strategy to use for the change of a transaction
 */
export type ChangeStrategy = "default" | "random" | "nominations";
/**
 * Status of a draft transaction
 */
export type DraftStatus = "draft" | "canceled" | "expired" | "complete";

/**
 * Draft transaction interface
 */
export interface DraftTransaction {
  id: string;
  hex: string;
  metadata?: Metadata;
  xpub_id: string;
  expires_at: Date;
  configuration: TransactionConfig;
  status: DraftStatus;
  final_tx_id?: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

/**
 * Utxo interface
 */
export interface Utxo {
  id: string;
  xpub_id: string;
  satoshis: number;
  script_pub_key: string;
  type: string;
  draft_id?: string;
  reserved_at?: Date;
  spending_tx_id?: string;
  transaction?: Transaction
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

/**
 * Array of utxos
 * @see {@link Utxo}
 */
export interface Utxos extends Array<Utxo> {}

/**
 * Admin stats interface
 */
export interface AdminStats {
  /**
   * Total balance of all outputs in sats in the database
   */
  balance: number;
  /**
   * Number of destinations in the database
   */
  destinations: number;
  /**
   * Number of transactions in the database
   */
  transactions: number;
  /**
   * Number of paymail addresses in the database
   */
  paymail_addresses: number;
  /**
   * Number of utxos in the database
   */
  utxos: number;
  /**
   * Number of xpubs registered in the database
   */
  xpubs: number;
  /**
   * A key value object of dates and number of transactions on that date (YYYYMMDD)
   */
  transactions_per_day: { [key: string]: any};
  /**
   * Number of utxos per output type
   */
  utxos_per_type: { [key: string]: any};
}

export interface TransportService {
  SetAdminKey(adminKey: string): void;
  SetDebug(debug: boolean): void;
  IsDebug(): boolean;
  SetSignRequest(debug: boolean): void;
  IsSignRequest(): boolean;
  RegisterXpub(rawXPub: string, metadata: Metadata): Promise<XPub>;
  AdminGetStatus(): Promise<boolean>
  AdminGetStats(): Promise<AdminStats>
  AdminGetAccessKeys(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<AccessKeys>
  AdminGetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number>
  AdminGetBlockHeaders(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<BlockHeaders>
  AdminGetBlockHeadersCount(conditions: Conditions, metadata: Metadata): Promise<number>
  AdminGetDestinations(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Destinations>
  AdminGetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number>
  AdminGetPaymail(address: string): Promise<PaymailAddress>
  AdminGetPaymails(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<PaymailAddresses>
  AdminGetPaymailsCount(conditions: Conditions, metadata: Metadata): Promise<number>
  AdminCreatePaymail(xPubID: string, address: string, public_name: string, avatar: string): Promise<PaymailAddress>
  AdminDeletePaymail(address: string): Promise<PaymailAddress>
  AdminGetTransactions(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Transactions>
  AdminGetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number>
  AdminGetUtxos(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Utxos>
  AdminGetUtxosCount(conditions: Conditions, metadata: Metadata): Promise<number>
  AdminGetXPubs(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<XPubs>;
  AdminGetXPubsCount(conditions: Conditions, metadata: Metadata): Promise<number>;
  AdminRecordTransaction(hex: string): Promise<Transaction>;
  GetXPub(): Promise<XPub>;
  UpdateXPubMetadata(metadata: Metadata): Promise<XPub>;
  GetAccessKey(id: string): Promise<AccessKey>;
  GetAccessKeys(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<AccessKeys>;
  GetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number>;
  CreateAccessKey(metadata: Metadata): Promise<AccessKey>;
  RevokeAccessKey(id: string): Promise<AccessKey>
  GetDestinationByID(id: string): Promise<Destination>
  GetDestinationByLockingScript(locking_script: string): Promise<Destination>
  GetDestinationByAddress(address: string): Promise<Destination>
  GetDestinations(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Destinations>
  GetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number>
  NewDestination(metadata: Metadata): Promise<Destination>;
  UpdateDestinationMetadataByID(id: string, metadata: Metadata): Promise<Destination>;
  UpdateDestinationMetadataByAddress(address: string, metadata: Metadata): Promise<Destination>;
  UpdateDestinationMetadataByLockingScript(lockingScript: string, metadata: Metadata): Promise<Destination>;
  NewPaymail(key: string, address: string, publicName?: string, avatar?: string, metadata?: Metadata): Promise<void>;
  DeletePaymail(address: string): Promise<void>;
  GetTransaction(txID: string): Promise<Transaction>;
  GetTransactions(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Transactions>;
  GetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number>;
  GetUtxo(tx_id: string, output_index: number): Promise<Utxo>;
  GetUtxos(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Utxos>;
  GetUtxosCount(conditions: Conditions, metadata: Metadata): Promise<number>;
  UnreserveUtxos(referenceID: string): Promise<void>;
  DraftToRecipients(recipients: Recipients, metadata: Metadata): Promise<DraftTransaction>;
  DraftTransaction(transactionConfig: TransactionConfigInput, metadata: Metadata): Promise<DraftTransaction>;
  RecordTransaction(hex: string, referenceID: string, metadata: Metadata): Promise<Transaction>;
  UpdateTransactionMetadata(txID: string, metadata: Metadata): Promise<Transaction>;
}

/**
 * Key basic information
 */
export interface Key {
  xPriv(): string
  xPub: PubKey
}

/**
 * Extends Key interface with mnemonic information
 */
export interface KeyWithMnemonic extends Key{
  mnemonic: string
}

/**
 * Public key information
 */
export interface PubKey {
  toString(): string
}


/**
 * Client options for instantiating a new Bux client
 */
export interface ClientOptions {
  accessKeyString?: string;
  accessKey?: bsv.PrivateKey;
  adminKey?: string;
  debug?: boolean;
  signRequest?: boolean;
  // transport?: TransportService;
  xPriv?: bsv.HDPrivateKey;
  xPrivString?: string;
  xPub?: bsv.HDPublicKey;
  xPubString?: string;
  xPubID?: string;
}

/**
 * Query params to limit and order database list results
 */
export interface QueryParams {
  /**
   * Page number to return (1 is first page)
   */
  page?: number;
  /**
   * Number of items to return per page
   */
  page_size?: number;
  /**
   * Order the results by this field
   */
  order_by_field?: string;
  /**
   * Sort order (desc, asc)
   */
  sort_direction?: string;
}

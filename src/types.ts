export interface Client {
  server_url: string;
}

// ExclusiveStartKeyPage is object to use when returning database records in paged format using Exclusive Start Key paging
export interface ExclusiveStartKeyPage<T> {
  // List of records for the response
  content: T;
  // Pagination details
  page: ExclusiveStartKeyPageInfo;
}

// ExclusiveStartKeyPageInfo is object to use when limiting and sorting database query results for Exclusive Start Key Paging
export interface ExclusiveStartKeyPageInfo {
  // Field by which to order the results
  orderByField?: string;
  // Direction in which to order the results ASC/DSC
  sortDirection?: string;
  // Total count of elements
  totalElements: number;
  // Size of the page/returned data
  size: number;
  // Last evaluated key returned from the DB
  lastEvaluatedKey: string;
}
/**
 * MerkleRoot interface
 *
 * Holds the content of the sync merkleroot response
 */
export interface MerkleRoot {
  merkleRoot: string;
  blockHeight: number;
}

/**
 * Repository interface
 *
 * Holds methods needed to get lastEvaluatedKey from the client's database and to save them
 */
export interface MerkleRootsRepository {
  // getLastMerkleRoot should return the merkle root with the heighest height from your storage or undefined if empty
  getLastMerkleRoot(): Promise<string | undefined>;
  // saveMerkleRoots should store newly synced merkle roots into your storage;
  // NOTE: items are ordered with ascending order by block height
  saveMerkleRoots(syncedMerkleRoots: MerkleRoot[]): Promise<void>;
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
        "v": "SPVWalletUserAPI v1.0.0"
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
  currentBalance: number;
  /**
   * Next internal (change address) number to use for a new destination
   *
   * NOTE: Do not use this to create new destinations, always let SPV Wallet create the destination
   */
  nextInternalNum: number;
  /**
   * Next external number to use for a new destination
   *
   * NOTE: Do not use this to create new destinations, always let SPV Wallet create the destination
   */
  nextExternalNum: number;
  /**
   * Date when this object was created
   */
  createdAt?: Date;
  /**
   * Date when this object was last updated
   */
  updatedAt?: Date;
  /**
   * If this object has been deleted, this date will be set
   */
  deletedAt?: Date;
}

/**
 * Page interface
 *
 * Holds information about the pagination state
 */
export interface Page {
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sortDirection: string;
  orderByField: string;
}

/**
 * Paged response interface
 *
 * Holds the content and page information
 */
export interface PageModel<T> {
  content: Array<T>;
  page: Page;
}

/**
 * Database key value conditions to filter on the metadata object
 *
 * @example
 * const metadata = {
 *   spvWalletVersion: "v0.1.3",
 *   someKey: "some value"
 * }
 */
export interface Metadata {
  /**
   * Key value element
   */
  [key: string]: any;
}

/**
 * Xpub interface
 *
 * @example
 * {
    "_id": "7406ab7d9e781685d6d0ceb319b84b332ff1b773ff0bbce1671d843d50c9532a",
    "createdAt": new Date(1645796112916),
    "metadata": [
      {
        "k": "user_agent",
        "v": "SPVWalletUserAPI v1.0.0"
      },
    ],
    "currentBalance": 99848517,
    "nextInternalNum": 100,
    "nextExternalNum": 229
  }
 */
export interface User {
  metadata?: Metadata;
  id: string;
  currentBalance: number;
  nextInternalNum: number;
  nextExternalNum: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

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
  paymailAddresses: number;
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
  transactionsPerDay: { [key: string]: any };
  /**
   * Number of utxos per output type
   */
  utxosPerType: { [key: string]: any };
}

/**
 * Access key interface for non-admin (User) endpoints.
 */
export interface AccessKey {
  id: string;
  xpubId: string;
  key?: string;
  metadata?: Metadata;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  revokedAt?: Date;
}

/**
 * NewContact interface for adding a new contact by admin.
 * creatorPaymail is the paymail of the user who will be owner of the contact and it's required for admin createContact action.
 */
export interface NewContact {
  creatorPaymail: string;
  fullName: string;
  metadata?: Metadata;
}

/**
 * Contact interface for non-admin (User) endpoints.
 */
export interface Contact {
  id: string;
  fullName: string;
  paymail: string;
  pubKey: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  metadata?: Metadata;
}

/**
 * Destination interface for non-admin (User) endpoints.
 */
export interface Destination {
  id: string;
  xpubId: string;
  lockingScript: string;
  type: string;
  chain: number;
  num: number;
  paymailExternalDerivationNum?: number;
  address: string;
  draftId: string;
  metadata: Metadata;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Transaction interface for non-admin (User) endpoints.
 */
export interface Tx {
  id: string;
  hex: string;
  blockHash: string;
  blockHeight: number;
  fee: number;
  numberOfInputs: number;
  numberOfOutputs: number;
  outputValue: number;
  totalValue: number;
  metadata?: Metadata;
  direction: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Transaction interface for Admin endpoints.
 */
export interface AdminTx extends Tx {
  draftId: string;
  xpubsInIds: string[];
  xpubOutIds: string[];
  outputs: Record<string, number>;
  status: string;
  outputValue: number;
}

/**
 * Utxo interface.
 */
export interface Utxo {
  id: string;
  xpubId: string;
  satoshis: number;
  scriptPubKey: string;
  type: string;
  draftId?: string;
  reservedAt?: Date;
  spendingTxId?: string;
  transaction?: Tx;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  metadata?: Metadata;
}

/**
 * Paymail address interface for Admin endpoints
 */
export interface PaymailAddress {
  id: string;
  xpubId: string;
  alias: string;
  domain: string;
  address: string;
  publicName: string;
  avatar: string;
  metadata: Metadata;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * OP_RETURN data for transactions.
 */
export interface OpReturn {
  hex?: string;
  hexParts?: string[];
  map?: MapProtocol;
  stringParts?: string[];
}

/**
 * MAP protocol definition.
 */
export interface MapProtocol {
  app?: string;
  type?: string;
  keys?: { [key: string]: any };
}

/**
 * Fee unit to use when calculating the fee for the transaction (satoshis per byte).
 */
export interface FeeUnit {
  satoshis: number;
  bytes: number;
}

/**
 * Configuration for syncing transaction on-chain.
 */
export interface SyncConfig {
  broadcast: boolean;
  broadcastInstant: boolean;
  syncOnChain: boolean;
  paymailP2p: boolean;
}

/**
 * A record pointing to a UTXO by transaction ID and output index.
 */
export interface UtxoPointer {
  transactionId: string;
  outputIndex: number;
}

/**
 * Transaction used as an input in a draft transaction.
 */
export interface TxInput {
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Metadata;
  deletedAt?: Date;
  id?: string;
  transactionId: string;
  xpubId?: string;
  outputIndex: number;
  satoshis: number;
  scriptPubKey: string;
  type: string;
  draftId?: string;
  reservedAt?: Date;
  spendingTxId?: string;
  destination?: Destination;
}

/**
 * Transaction output record in a draft transaction.
 */
export interface TxOutput {
  paymailP4?: PaymailP4;
  satoshis?: number;
  script?: string;
  scripts?: ScriptOutput[];
  to?: string;
  opReturn?: OpReturn;
}

/**
 * Script output of a transaction.
 */
export interface ScriptOutput {
  address?: string;
  satoshis?: number;
  script: string;
  scriptType?: string;
}

/**
 * Paymail p2p record for communicating with other p2p providers.
 */
export interface PaymailP4 {
  alias: string;
  domain: string;
  fromPaymail?: string;
  note?: string;
  pubKey?: string;
  receiveEndpoint?: string;
  referenceId?: string;
  resolutionType: string;
}

/**
 * Configuration for a new transaction.
 */
export interface TxConfig {
  changeDestinations?: Destination[];
  changeDestinationsStrategy?: ChangeStrategy;
  changeMinimumSatoshis?: number;
  changeNumberOfDestinations?: number;
  changeSatoshis?: number;
  expiresIn?: number;
  fee?: number;
  feeUnit?: FeeUnit;
  fromUtxos?: UtxoPointer[];
  includeUtxos?: UtxoPointer[];
  inputs?: TxInput[];
  miner?: string;
  outputs: TxOutput[];
  sendAllTo?: string;
  sync?: SyncConfig;
}

/**
 * Configuration for a draft transaction.
 */
export interface DraftTransactionConfig {
  changeDestinations?: Destination[];
  changeDestinationsStrategy?: ChangeStrategy;
  changeMinimumSatoshis?: number;
  changeNumberOfDestinations?: number;
  changeSatoshis?: number;
  expiresIn?: number;
  fee?: number;
  feeUnit?: FeeUnit;
  fromUtxos?: UtxoPointer[];
  miner?: string;
  outputs: TxOutput[];
  sendAllTo?: string;
  sync?: SyncConfig;
}

/**
 * Status of a draft transaction.
 */
export type DraftStatus = 'draft' | 'canceled' | 'expired' | 'complete';

/**
 * Draft transaction interface.
 */
export interface DraftTx {
  id: string;
  hex: string;
  metadata?: Metadata;
  xpubId: string;
  expiresAt: Date;
  configuration: TxConfig;
  status: DraftStatus;
  finalTxId?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Strategy to use for the change of a transaction.
 */
export type ChangeStrategy = 'default' | 'random' | 'nominations';

/**
 * Key basic information.
 */
export interface Key {
  xPriv(): string;
  xPub: PubKey;
}

/**
 * Extends Key interface with mnemonic information.
 */
export interface KeyWithMnemonic extends Key {
  mnemonic: string;
}

/**
 * Public key information.
 */
export interface PubKey {
  toString(): string;
}

export interface AdminKey {
  adminKey: string;
}

/**
 * Webhook interface for admin endpoints.
 */
export interface Webhook {
  url: string;
  banned: boolean;
}

export type AdminClientOptions = AdminKey;

export interface XpubWithoutSigning {
  xPriv?: never;
  xPub: string;
  accessKey?: never;
}

export interface XprivWithSigning {
  xPriv?: string;
  xPub?: never;
  accessKey?: never;
}

export interface AccessKeyWithSigning {
  xPriv?: never;
  xPub?: never;
  accessKey: string;
}

export type ClientOptions = XpubWithoutSigning | XprivWithSigning | AccessKeyWithSigning;

/**
 * Query page params to limit and order database list results.
 */
export interface QueryPageParams {
  page?: number;
  size?: number;
  sort?: string;
  sortBy?: string;
}

/**
 * SharedConfig defines the configuration shared by different parts of the application.
 */
export interface SharedConfig {
  paymailDomains: string[];
  experimentalFeatures: { [key: string]: boolean };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE';

// StringEvent - event with string value; can be used for generic messages and it's used for testing
export interface StringEvent {
  value: string;
}

// UserEvent - event with user identifier
export interface UserEvent {
  xpubId: string;
}

// TransactionEvent - event for transaction changes
export interface TransactionEvent extends UserEvent {
  transactionId: string;
  status: string;
  xpubOutputValue: Record<string, number>;
}

// Events - a mapping of event names to their respective event types.
// This enables strict typing for event handling across different event types.
// If one adds new Event it should also be mapped here.
export type Events = {
  StringEvent: StringEvent;
  UserEvent: UserEvent;
  TransactionEvent: TransactionEvent;
};

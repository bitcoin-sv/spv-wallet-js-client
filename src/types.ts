export interface Client {
  server_url: string;
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
export interface PagedResponse<T> {
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
        "v": "SpvWalletClient v1.0.0"
      },
    ],
    "currentBalance": 99848517,
    "nextInternalNum": 100,
    "nextExternalNum": 229
  }
 */
export interface User {
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
 * Array of xpubs
 * @see {@link User}
 */
export interface Users extends Array<User> {}

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
  xpubId: string;
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
  createdAt: Date;
  /**
   * Date when this object was last updated
   */
  updatedAt?: Date;
  /**
   * If this object has been deleted, this date will be set
   */
  deletedAt?: Date;
  /**
   * If this access key has been revoked, this date will be set and the access key will not work anymore
   */
  revokedAt?: Date;
}

/**
 * Array of access keys
 * @see {@link AccessKey}
 */
export interface AccessKeys extends Array<AccessKey> {}

export interface Contact {
  /**
   * ID of the contact
   */
  id: string;
  /**
   * Full name is name which could be shown instead of whole paymail address.
   */
  fullName: string;
  /**
   * Paymail related to contact
   */
  paymail: string;
  /**
   * Public key is a public key related to contact (receiver)
   */
  pubKey: string;
  /**
   * Status is a contact's current status.
   */
  status: string;
  /**
   * Date when this object was created
   */
  createdAt: Date;
  /**
   * Date when this object was last updated
   */
  updatedAt?: Date;
  /**
   * If this object has been deleted, this date will be set
   */
  deletedAt?: Date;
  /**
   * Metadata object
   */
  metadata?: Metadata;
}

/**
 * Array of contacts
 * @see {@link Contact}
 */
export interface Contacts extends PagedResponse<Contact> {}

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
  xpubId: string;
  /**
   * Locking script (script pub key) of the destination
   */
  lockingScript: string;
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
   * Paymail derivation number used for the derivation of the destination
   */
  paymailExternalDerivationNum?: number;
  /**
   * Address of the destination, empty of not p2pkh
   */
  address: string;
  /**
   * ID of the draft transaction associated with this destination
   */
  draftId: string;
  /**
   * Metadata object
   */
  metadata: Metadata;
  /**
   * Date when this object was created
   */
  createdAt: Date;
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
 * Array of destinations
 * @see {@link Destination}
 */
export interface Destinations extends Array<Destination> {}

/**
 * Tx
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
 * Array of transactions
 * @see {@link Tx}
 */
export interface Txs extends Array<Tx> {}

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
  hexParts?: string[];
  /**
   * MAP protocol definition
   * @see {@link Map}
   */
  map?: MapProtocol;
  /**
   * String parts array
   */
  stringParts?: string[];
}

/**
 * Output interface
 */
export interface Output {
  to: string;
  satoshis: number;
  opReturn?: OpReturn;
}

/**
 * Array of Outputs
 * @see {@link Output}
 */
export interface Outputs extends Array<Output> {}

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
  transactionId: string;
  /**
   * Output index
   */
  outputIndex: number;
}

/**
 * Transaction used as an input in a draft transaction
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
 * Paymail address interface
 */
export interface PaymailAddress {
  id: string;
  xpubId: string;
  alias: string;
  domain: string;
  publicName: string;
  avatar: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
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
  fromPaymail?: string;
  note?: string;
  pubKey?: string;
  receiveEndpoint?: string;
  referenceId?: string;
  resolutionType: string;
}

/**
 * Script output of a transaction
 */
export interface ScriptOutput {
  address?: string;
  satoshis?: number;
  script: string;
  scriptType?: string;
}

/**
 * Transaction output record in a draft transaction
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
 * Configuration for syncing transaction on-chain
 */
export interface SyncConfig {
  broadcast: boolean;
  broadcastInstant: boolean;
  syncOnChain: boolean;
  paymailP2p: boolean;
}

/**
 * Configuration for a new transaction
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
 * Transaction input in a new transaction
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
 * Strategy to use for the change of a transaction
 */
export type ChangeStrategy = 'default' | 'random' | 'nominations';
/**
 * Status of a draft transaction
 */
export type DraftStatus = 'draft' | 'canceled' | 'expired' | 'complete';

/**
 * Draft transaction interface
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
 * Utxo interface
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
 * Key basic information
 */
export interface Key {
  xPriv(): string;
  xPub: PubKey;
}

/**
 * Extends Key interface with mnemonic information
 */
export interface KeyWithMnemonic extends Key {
  mnemonic: string;
}

/**
 * Public key information
 */
export interface PubKey {
  toString(): string;
}

export interface AdminKey {
  /**
   * adminKey is used for signing admin requests.
   * Regardless of the signing method, the adminKey is required for admin requests.
   * It will not work for non-admin requests - to use them, provide xPub, xPriv or accessKey.
   */
  adminKey: string;
}

export interface OptionalAdminKey extends Partial<AdminKey> {}

export interface XpubWithoutSigning extends OptionalAdminKey {
  /**
   * With xPub you can make non-admin requests without signing.
   * The SendToRecipients function will not work because it requires the xPriv.
   */
  xPub: string;
}

export interface XprivWithSigning extends OptionalAdminKey {
  /**
   * xPriv is used for signing non-admin requests.
   */
  xPriv: string;
}

export interface AccessKeyWithSigning extends OptionalAdminKey {
  /**
   * accessKey is used for signing non-admin requests.
   * If you want to use SendToRecipients function, you have to provide the xPriv.
   */
  accessKey: string;
}

export interface Webhook {
  /**
   * The URL for the webhook.
   */
  url: string;
  /**
   * Indicates whether the entity is banned or not.
   */
  banned: boolean;
}

export type ClientOptions = XpubWithoutSigning | XprivWithSigning | AccessKeyWithSigning | AdminKey;

/**
 * Client options for instantiating a new SPV Wallet client
 */
// export type ClientOptions = NonSigningOptions | SigningOptions;

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
  pageSize?: number;
  /**
   * Order the results by this field
   */
  orderByField?: string;
  /**
   * Sort order (desc, asc)
   */
  sortDirection?: string;
}

/**
 * SharedConfig is an interface that defines the configuration shared by different parts of the application.
 */
export interface SharedConfig {
  /**
   * PaymailDomains is an array of strings representing the allowed Paymail domains.
   */
  paymailDomains: string[];

  /**
   * ExperimentalFeatures is a map of experimental features handled by spv-wallet.
   * The keys are strings representing the feature names, and the values are booleans representing whether the feature is enabled or not.
   */
  experimentalFeatures: { [key: string]: boolean };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE';

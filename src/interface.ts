import bsv from 'bsv';

export interface Client {
  server_url: string;
  transport: TransportService;
}

export type TransportType = "http" | "graphql";

export interface Conditions {
  [key: string]: any
}

export interface Metadata {
  [key: string]: any
}

export interface XPub {
  created_at?: Date;
  updated_at?: Date;
  metadata?: Metadata;
  deleted_at?: Date;
  id: string;
  current_balance: number;
  next_internal_num: number;
  next_external_num: number;
}

export interface Destination {
  id: string;
  xpub_id: string;
  locking_script: string;
  type: string;
  chain: number;
  num: number;
  address: string;
  draft_id: string;
  metadata: Metadata;
}
export interface Destinations extends Array<Destination> {}

export interface IDs extends Array<string> {}

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
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface MapProtocol {
  app?: string;
  keys?: { [key: string]: any };
  type?: string;
}

export interface OpReturn {
  hex?: string;
  hex_parts?: string[];
  map?: MapProtocol;
  string_parts?: string[];
}

export interface Recipient {
  to: string;
  satoshis: number;
  op_return?: OpReturn;
}
export interface Recipients extends Array<Recipient> {}

export interface FeeUnit {
  satoshis: number;
  bytes: number;
}

export interface UtxoPointer {
  transaction_id: string;
  output_index: number;
}

export interface TransactionInput {
  created_at?: Date;
  updated_at?: Date;
  metadata?: Metadata;
  deleted_at?: Date;
  id: string;
  transaction_id: string;
  xpub_id: string;
  output_index: number;
  satoshis: number;
  script_pub_key: string;
  type: string;
  draft_id?: string;
  reserved_at?: Date;
  spending_tx_id?: string;
  destination: Destination;
}

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

export interface ScriptOutput {
  address?: string;
  satoshis?: number;
  script: string;
  script_type: string;
}

export interface TransactionOutput {
  paymail_p4?: PaymailP4;
  satoshis?: number;
  scripts?: ScriptOutput[];
  to?: string;
  op_return?: OpReturn;
}

export interface SyncConfig {
  broadcast: boolean;
  sync_on_chain: boolean;
}

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
  inputs: TransactionInput[];
  miner?: string;
  outputs: TransactionOutput[];
  send_all_to?: string;
  sync?: SyncConfig;
}

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

export type ChangeStrategy = "default" | "random" | "nominations";
export type DraftStatus = "draft" | "canceled" | "expired" | "complete";

export interface DraftTransaction {
  created_at: string;
  updated_at?: string;
  metadata?: Metadata;
  deleted_at?: Date;
  id: string;
  hex: string;
  xpub_id: string;
  expires_at: Date;
  configuration: TransactionConfig;
  status: DraftStatus;
  final_tx_id?: string;
}

export interface Transactions extends Array<Transaction> {}

export interface TransportService {
  SetAdminKey(adminKey: string): void;
  SetDebug(debug: boolean): void;
  IsDebug(): boolean;
  SetSignRequest(debug: boolean): void;
  IsSignRequest(): boolean;
  RegisterXpub(rawXPub: string, metadata: Metadata): Promise<XPub>;
  GetXPub(): Promise<XPub>;
  GetAccessKey(id: string): Promise<AccessKey>;
  GetAccessKeys(metadata: Metadata): Promise<AccessKeys>;
  CreateAccessKey(metadata: Metadata): Promise<AccessKey>;
  RevokeAccessKey(id: string): Promise<AccessKey>
  GetDestinationByID(id: string): Promise<Destination>
  GetDestinationByLockingScript(locking_script: string): Promise<Destination>
  GetDestinationByAddress(address: string): Promise<Destination>
  GetDestinations(metadata: Metadata): Promise<Destinations>
  NewDestination(metadata: Metadata): Promise<Destination>;
  GetTransaction(txID: string): Promise<Transaction>;
  GetTransactions(conditions: Conditions, metadata: Metadata): Promise<Transactions>;
  DraftToRecipients(recipients: Recipients, metadata: Metadata): Promise<DraftTransaction>;
  DraftTransaction(transactionConfig: TransactionConfigInput, metadata: Metadata): Promise<DraftTransaction>;
  RecordTransaction(hex: string, referenceID: string, metadata: Metadata): Promise<Transaction>;
}

export interface ClientOptions {
  accessKeyString?: string;
  accessKey?: bsv.PrivateKey;
  adminKey?: string;
  debug?: boolean;
  signRequest?: boolean;
  transport?: TransportService;
  transportType?: TransportType;
  xPriv?: bsv.HDPrivateKey;
  xPrivString?: string;
  xPub?: bsv.HDPublicKey;
  xPubString?: string;
  xPubID?: string;
}

export interface AccessKey {
  id: string;
  xpub_id: string;
  key?: string;
  metadata?: Metadata;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  revoked_at?: Date;
}

export interface AccessKeys extends Array<AccessKey> {}

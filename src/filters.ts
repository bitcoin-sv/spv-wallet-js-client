// TimeRange defines a range between two points in time.
export interface TimeRange {
  from?: string; // from specifies the start time of the range. It's optional and can be nil.
  to?: string; // to specifies the end time of the range. It's optional and can be nil
}

// ModelFilter is a common model filter that contains common fields for all model filters.
export interface ModelFilter {
  includeDeleted?: boolean; // includeDeleted is a flag whether or not to include deleted items in the search results
  createdRange?: TimeRange; // createdRange specifies the time range when a record was created.
  updatedRange?: TimeRange; // updatedRange specifies the time range when a record was updated.
}

export interface AccessKeyFilter extends ModelFilter {
  revokedRange?: TimeRange;
}

export interface AdminAccessKeyFilter extends AccessKeyFilter {
  xpubId?: string;
}

export type ContactStatus = 'unconfirmed' | 'awaiting' | 'confirmed' | 'rejected';
export interface ContactFilter extends ModelFilter {
  id?: string;
  fullName?: string;
  paymail?: string;
  pubKey?: string;
  status?: ContactStatus;
}

export interface DestinationFilter extends ModelFilter {
  lockingScript?: string;
  address?: string;
  draftId?: string;
}

export interface AdminPaymailFilter extends ModelFilter {
  id?: string;
  xpubId?: string;
  alias?: string;
  domain?: string;
  publicName?: string;
}

export interface PaymailFilter extends ModelFilter {
  id?: string;
  alias?: string;
  domain?: string;
  publicName?: string;
}

export type TransactionStatus =
  | 'UNKNOWN'
  | 'QUEUED'
  | 'RECEIVED'
  | 'STORED'
  | 'ANNOUNCED_TO_NETWORK'
  | 'REQUESTED_BY_NETWORK'
  | 'SENT_TO_NETWORK'
  | 'ACCEPTED_BY_NETWORK'
  | 'SEEN_ON_NETWORK'
  | 'MINED'
  | 'SEEN_IN_ORPHAN_MEMPOOL'
  | 'CONFIRMED'
  | 'REJECTED';

export interface TransactionFilter extends ModelFilter {
  id?: string;
  hex?: string;
  blockHash?: string;
  blockHeight?: number;
  fee?: number;
  numberOfInputs?: number;
  numberOfOutputs?: number;
  draftId?: string;
  totalValue?: number;

  // status is typically of the type TransactionStatus. However, it can be any string to accommodate custom situations.
  status?: TransactionStatus | string;
}

export type UtxoType =
  | 'pubkey'
  | 'pubkeyhash'
  | 'nulldata'
  | 'multisig'
  | 'nonstandard'
  | 'scripthash'
  | 'metanet'
  | 'token_stas'
  | 'token_sensible';

export interface UtxoFilter extends ModelFilter {
  transactionId?: string;
  outputIndex?: number;
  id?: string;
  satoshis?: number;
  scriptPubKey?: string;
  type?: UtxoType;
  draftId?: string;
  reservedRange?: TimeRange;
  spendingTxId?: string;
}

export interface AdminUtxoFilter extends UtxoFilter {
  xpubId?: string;
}

export interface XpubFilter extends ModelFilter {
  id?: string;
  currentBalance?: number;
}

export interface AdminContactFilter extends ContactFilter {
  xpubId?: string;
}

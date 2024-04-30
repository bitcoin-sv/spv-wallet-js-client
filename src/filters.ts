export interface TimeRange {
  from?: string;
  to?: string;
}

export interface ModelFilter {
  includeDeleted?: boolean;
  createdRange?: TimeRange;
  updatedRange?: TimeRange;
}

export interface AccessKeyFilter extends ModelFilter {}

export interface ContactFilter extends ModelFilter {
  id?: string;
  fullName?: string;
  paymail?: string;
  pubKey?: string;
  status?: 'unconfirmed' | 'awaiting' | 'confirmed' | 'rejected';
}

export interface DestinationFilter extends ModelFilter {
  lockingScript?: string;
  address?: string;
  draftId?: string;
}

export interface PaymailFilter extends ModelFilter {
  id?: string;
  alias?: string;
  domain?: string;
  publicName?: string;
  avatar?: string;
  externalXpubKey?: string;
  externalXpubNum?: number;
  pubkeyNum?: number;
  xpubDerivationSeq?: number;
}

export interface TransactionFilter extends ModelFilter {
  hex?: string;
  blockHash?: string;
  blockHeight?: number;
  fee?: number;
  numberOfInputs?: number;
  numberOfOutputs?: number;
  draftId?: string;
  totalValue?: number;
  status?:
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
    | 'REJECTED'
    | string;
}

export interface UtxoFilter extends ModelFilter {
  transactionId?: string;
  outputIndex?: number;
  id?: string;
  xpubId?: string;
  satoshis?: number;
  scriptPubKey?: string;
  type?:
    | 'pubkey'
    | 'pubkeyhash'
    | 'nulldata'
    | 'multisig'
    | 'nonstandard'
    | 'scripthash'
    | 'metanet'
    | 'token_stas'
    | 'token_sensible';
  draftId?: string;
  reservedRange?: TimeRange;
  spendingTxId?: string;
}

export interface XpubFilter extends ModelFilter {
  id?: string;
  currentBalance?: number;
  nextInternalNum?: number;
  nextExternalNum?: number;
}

import bsv from 'bsv';
import TransportHTTP from "./transports/http";
import TransportGraphQL from "./transports/graphql";
import {
  AccessKey,
  AccessKeys,
  BlockHeaders,
  Client,
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
  TransactionConfig,
  Transactions,
  TransportService,
  Utxos,
  XPub,
  XPubs
} from "./interface";
import {
  getGraphQLMiddleware,
} from "./transports/graphql";

class BuxClient implements TransportService {
  client: Client;
  options: ClientOptions | undefined;

  constructor(serverUrl: string, options: ClientOptions) {
    this.client = {
      server_url: serverUrl,
      transport: this.parseOptions(serverUrl, options),
    }

    if (!this.client.transport) {
      throw new Error("transport cannot be null")
    }
  }

  parseOptions(serverUrl: string, options: ClientOptions) {
    // http is the default transport
    if (!options.transportType) options.transportType = "http";

    if (options.xPriv) {
      options.xPrivString = options.xPriv.toString();
      options.xPub = options.xPriv.hdPublicKey;
      options.xPubString = options.xPub.toString();
    } else if (options.xPrivString) {
      options.xPriv = bsv.HDPrivateKey.fromString(options.xPrivString);
      options.xPub = options.xPriv.hdPublicKey;
      options.xPubString = options.xPub.toString();
    } else if (options.xPub) {
      options.xPriv = undefined;
      options.xPrivString = undefined;
      options.xPubString = options.xPub.toString();
    } else if (options.xPubString) {
      options.xPriv = undefined;
      options.xPrivString = undefined;
      options.xPub = bsv.HDPublicKey.fromString(options.xPubString);
    } else if (options.accessKey) {
      options.xPriv = undefined;
      options.xPrivString = undefined;
      options.xPub = undefined;
      options.xPubString = undefined;
      options.accessKeyString = options.accessKey.toString();
      const pubAccessKey = options.accessKey.publicKey.toString();
      options.xPubID = bsv.crypto.Hash.sha256(Buffer.from(pubAccessKey || '')).toString('hex');
    }

    if (options.xPubString) {
      options.xPubID = bsv.crypto.Hash.sha256(Buffer.from(options.xPubString || '')).toString('hex');
    }

    let transport: TransportService;
    if (options.transportType === "graphql") {
      transport = new TransportGraphQL(serverUrl, options)
    } else {
      transport = new TransportHTTP(serverUrl, options)
    }

    this.options = options;

    return transport;
  }

  SetAdminKey(adminKey: string): void {
    this.client.transport.SetAdminKey(adminKey)
  }

  SetDebug(debug: boolean): void {
    this.client.transport.SetDebug(debug)
  }

  SetSignRequest(signRequest: boolean): void {
    this.client.transport.SetSignRequest(signRequest)
  }

  IsDebug(): boolean {
    return this.client.transport.IsDebug();
  }

  IsSignRequest(): boolean {
    return this.client.transport.IsSignRequest();
  }

  async AdminGetStatus(): Promise<boolean> {
    return await this.client.transport.AdminGetStatus();
  }

  async AdminGetStats(): Promise<any> {
    return await this.client.transport.AdminGetStats();
  }

  async AdminGetAccessKeys(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<AccessKeys> {
    return await this.client.transport.AdminGetAccessKeys(conditions, metadata, queryParams);
  }

  async AdminGetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.client.transport.AdminGetAccessKeysCount(conditions, metadata);
  }

  async AdminGetBlockHeaders(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<BlockHeaders> {
    return await this.client.transport.AdminGetBlockHeaders(conditions, metadata, queryParams);
  }

  async AdminGetBlockHeadersCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.client.transport.AdminGetBlockHeadersCount(conditions, metadata);
  }

  async AdminGetDestinations(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Destinations> {
    return await this.client.transport.AdminGetDestinations(conditions, metadata, queryParams);
  }

  async AdminGetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.client.transport.AdminGetDestinationsCount(conditions, metadata);
  }

  async AdminGetPaymail(address: string): Promise<PaymailAddress> {
    return await this.client.transport.AdminGetPaymail(address);
  }

  async AdminGetPaymails(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<PaymailAddresses> {
    return await this.client.transport.AdminGetPaymails(conditions, metadata, queryParams);
  }

  async AdminGetPaymailsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.client.transport.AdminGetPaymailsCount(conditions, metadata);
  }

  async AdminCreatePaymail(xPubID: string, address: string, public_name: string, avatar: string): Promise<PaymailAddress> {
    return await this.client.transport.AdminCreatePaymail(xPubID, address, public_name, avatar);
  }

  async AdminDeletePaymail(address: string): Promise<PaymailAddress> {
    return await this.client.transport.AdminDeletePaymail(address);
  }

  async AdminGetTransactions(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Transactions> {
    return await this.client.transport.AdminGetTransactions(conditions, metadata, queryParams);
  }

  async AdminGetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.client.transport.AdminGetTransactionsCount(conditions, metadata);
  }

  async AdminGetUtxos(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Utxos> {
    return await this.client.transport.AdminGetUtxos(conditions, metadata, queryParams);
  }

  async AdminGetUtxosCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.client.transport.AdminGetUtxosCount(conditions, metadata);
  }

  async GetXPub(): Promise<XPub> {
    return await this.client.transport.GetXPub();
  }

  async AdminGetXPubs(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<XPubs> {
    return await this.client.transport.AdminGetXPubs(conditions, metadata, queryParams);
  }

  async AdminGetXPubsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.client.transport.AdminGetXPubsCount(conditions, metadata);
  }

  async UpdateXPubMetadata(metadata: Metadata): Promise<XPub> {
    return await this.client.transport.UpdateXPubMetadata(metadata);
  }

  async GetAccessKey(id: string): Promise<AccessKey> {
    return await this.client.transport.GetAccessKey(id);
  }

  async GetAccessKeys(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<AccessKeys> {
    return await this.client.transport.GetAccessKeys(conditions, metadata, queryParams);
  }

  async GetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.client.transport.GetAccessKeysCount(conditions, metadata);
  }

  async CreateAccessKey(metadata: Metadata): Promise<AccessKey> {
    return await this.client.transport.CreateAccessKey(metadata);
  }

  async RevokeAccessKey(id: string): Promise<AccessKey> {
    return await this.client.transport.RevokeAccessKey(id);
  }

  async GetDestinationByID(id: string): Promise<Destination> {
    return await this.client.transport.GetDestinationByID(id);
  }

  async GetDestinationByLockingScript(locking_script: string): Promise<Destination> {
    return await this.client.transport.GetDestinationByLockingScript(locking_script);
  }

  async GetDestinationByAddress(address: string): Promise<Destination> {
    return await this.client.transport.GetDestinationByAddress(address);
  }

  async GetDestinations(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Destinations> {
    return await this.client.transport.GetDestinations(conditions, metadata, queryParams);
  }

  async GetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.client.transport.GetDestinationsCount(conditions, metadata);
  }

  async NewDestination(metadata: Metadata): Promise<Destination> {
    return await this.client.transport.NewDestination(metadata);
  }

  async UpdateDestinationMetadataByID(id: string, metadata: Metadata): Promise<Destination> {
    return await this.client.transport.UpdateDestinationMetadataByID(id, metadata);
  }

  async UpdateDestinationMetadataByLockingScript(locking_script: string, metadata: Metadata): Promise<Destination> {
    return await this.client.transport.UpdateDestinationMetadataByLockingScript(locking_script, metadata);
  }

  async UpdateDestinationMetadataByAddress(address: string, metadata: Metadata): Promise<Destination> {
    return await this.client.transport.UpdateDestinationMetadataByAddress(address, metadata);
  }

  async GetTransaction(txID: string): Promise<Transaction> {
    return await this.client.transport.GetTransaction(txID);
  }

  async GetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return await this.client.transport.GetTransactionsCount(conditions, metadata);
  }

  async GetTransactions(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Transactions> {
    return await this.client.transport.GetTransactions(conditions, metadata, queryParams);
  }

  async DraftToRecipients(recipients: Recipients, metadata: Metadata): Promise<DraftTransaction> {
    return await this.client.transport.DraftToRecipients(recipients, metadata);
  }

  async DraftTransaction(transactionConfig: TransactionConfig, metadata: Metadata): Promise<DraftTransaction> {
    return await this.client.transport.DraftTransaction(transactionConfig, metadata);
  }

  async SendToRecipients(recipients: Recipients, metadata: Metadata): Promise<Transaction> {
    const draft = await this.DraftToRecipients(recipients, metadata);
    const finalized = this.FinalizeTransaction(draft);
    return this.RecordTransaction(finalized, draft.id, metadata)
  }

  FinalizeTransaction(draftTransaction: DraftTransaction): string {
    if (!this.options?.xPriv) {
      throw new Error("cannot sign transaction without an xPriv")
    }

    const Input = bsv.Transaction.Input;
    const xPriv = this.options.xPriv as bsv.HDPrivateKey;
    const txDraft = new bsv.Transaction(draftTransaction.hex);

    // sign the inputs
    const privateKeys: bsv.PrivateKey[] = [];
    draftTransaction.configuration.inputs.forEach((input, index) => {
      const chainKey = xPriv.deriveChild(input.destination.chain);
      const numKey =  chainKey.deriveChild(input.destination.num);
      privateKeys.push(numKey.privateKey);

      // small sanity check for the inputs
      if (
        input.transaction_id != txDraft.inputs[index].prevTxId.toString('hex')
        ||
        input.output_index != txDraft.inputs[index].outputIndex
      ) {
        throw new Error("input tx ids do not match in draft and transaction hex")
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
        })
      });
    });

    txDraft.sign(privateKeys)

    if (!txDraft.verify()) {
      throw new Error("transaction verification failed");
    }
    if (!txDraft.isFullySigned()) {
      throw new Error("transaction could not be fully signed");
    }

    return txDraft.serialize();
  }

  async RecordTransaction(hex: string, referenceID: string, metadata: Metadata): Promise<Transaction> {
    return await this.client.transport.RecordTransaction(hex, referenceID, metadata);
  }

  async UpdateTransactionMetadata(txID: string, metadata: Metadata): Promise<Transaction> {
    return await this.client.transport.UpdateTransactionMetadata(txID, metadata);
  }

  async RegisterXpub(rawXPub: string, metadata: Metadata): Promise<XPub> {
    return await this.client.transport.RegisterXpub(rawXPub, metadata);
  }

  async RegisterXpubWithToken(rawXPub: string, token: string, metadata: Metadata): Promise<XPub> {
    return await this.client.transport.RegisterXpubWithToken(rawXPub, token, metadata);
  }
}

export {
  BuxClient,
  getGraphQLMiddleware,
};
export * from "./authentication";
export * from "./interface";

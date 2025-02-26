import {
    AccessKey,
    Contact,
    DraftTransactionConfig,
    DraftTx,
    ExclusiveStartKeyPage,
    MerkleRoot,
    Metadata,
    SharedConfig,
    Tx,
    User,
    PaymailAddress,
    PageModel,
    Utxo,
    MerkleRootsRepository,
    QueryPageParams,
    ClientOptions,
  } from './types';
  
  import { AccessKeyFilter, ContactFilter, PaymailFilter, TransactionFilter, UtxoFilter } from './filters';
  
  import { defaultLogger, Logger, LoggerConfig, makeLogger } from './logger';
  import { HttpClient } from './httpclient';
  import { buildQueryPath } from './query/query-builder';
  import {
    ErrorNoXPrivToGenerateTOTP,
    ErrorNoXPrivToSignTransaction,
    ErrorNoXPrivToValidateTOTP,
    ErrorStaleLastEvaluatedKey,
    ErrorSyncMerkleRootsTimeout,
    ErrorTxIdsDontMatchToDraft,
    ErrorWrongTOTP,
    ErrorInvalidClientOptions,
  } from './errors';
  import { HD, P2PKH, Transaction, PrivateKey } from '@bsv/sdk';
  import { DEFAULT_TOTP_DIGITS, DEFAULT_TOTP_PERIOD, generateTotpForContact, validateTotpForContact } from './totp';
  
  /**
   * SPVWalletUserAPI class for handling user-specific operations
   *
   * @class SPVWalletUserAPI
   */
  export class SPVWalletUserAPI {
    private logger: Logger;
    private http: HttpClient;
    private xPriv?: HD;
  
    /**
     * Creates a new instance of SPVWalletUserAPI
     *
     * @param {string} serverUrl - The base URL of the SPV Wallet server
     * @param {ClientOptions} options - Configuration options including xPub, xPriv, or accessKey
     * @param {LoggerConfig} loggerConfig - Logger configuration (optional)
     */
    constructor(serverUrl: string, options: ClientOptions, loggerConfig: LoggerConfig = defaultLogger) {
      serverUrl = this.ensureSuffix(serverUrl, '/api/v1');
      this.logger = makeLogger(loggerConfig);
      this.http = this.makeRequester(options, serverUrl);
    }
  
    private ensureSuffix(serverUrl: string, suffix: string): string {
      return serverUrl.endsWith(suffix) ? serverUrl : serverUrl + suffix;
    }
  
    private makeRequester(options: ClientOptions, serverUrl: string): HttpClient {
      if (options.xPub) {
        this.logger.info('Using XPub. SendToRecipients function will not be available.');
        return new HttpClient(this.logger, serverUrl, options.xPub);
      }
  
      if (options.xPriv) {
        this.logger.info('Using xPriv to sign requests');
        this.xPriv = new HD().fromString(options.xPriv);
        return new HttpClient(this.logger, serverUrl, this.xPriv);
      }
  
      if (options.accessKey) {
        this.logger.info('Using accessKey to sign requests. SendToRecipients will not be available.');
        const signingKey = PrivateKey.fromString(options.accessKey, 'hex');
        return new HttpClient(this.logger, serverUrl, signingKey);
      }
  
      throw new ErrorInvalidClientOptions(this.logger, options);
    }
  
    /**
     * Get a list of all contacts for the current user
     *
     * @param {ContactFilter} conditions - Key value object to use to filter the documents
     * @param {Metadata} metadata - Key value object to use to filter the documents by the metadata
     * @param {QueryPageParams} queryParams - Database query parameters for page, page size and sorting
     * @returns {Promise<PageModel<Contact>>} List of contacts matching the criteria
     */
    async contacts(
      conditions: ContactFilter,
      metadata: Metadata,
      queryParams: QueryPageParams,
    ): Promise<PageModel<Contact>> {
      const basePath = 'contacts';
      const queryString = buildQueryPath({
        filter: conditions,
        metadata: metadata,
        page: queryParams,
      });
  
      return await this.http.request(`${basePath}${queryString}`, 'GET');
    }
  
    /**
     * Get a single contact by paymail address
     *
     * @param {string} paymail - Paymail address of the contact
     * @returns {Promise<Contact>} Contact information
     */
    async contactWithPaymail(paymail: string): Promise<Contact> {
      return await this.http.request(`contacts/${paymail}`, 'GET');
    }
  
    /**
     * Update or insert a contact
     *
     * @param {string} paymail - Contact's paymail address
     * @param {string} fullName - Full name of the contact
     * @param {string} requesterPaymail - Paymail of the requester
     * @param {Metadata} metadata - Additional metadata for the contact
     * @returns {Promise<Contact>} Updated or created contact
     */
    async upsertContact(
      paymail: string,
      fullName: string,
      requesterPaymail: string,
      metadata: Metadata,
    ): Promise<Contact> {
      let payload = { fullName, requesterPaymail, metadata };
      if (requesterPaymail !== '') {
        payload['requesterPaymail'] = requesterPaymail;
      }
      return await this.http.request(`contacts/${paymail}`, 'PUT', payload);
    }
  
    /**
     * Remove a contact by paymail address
     *
     * @param {string} paymail - Paymail address of the contact to remove
     * @returns {Promise<void>}
     */
    async removeContact(paymail: string): Promise<void> {
      return await this.http.request(`contacts/${paymail}`, 'DELETE');
    }
  
    /**
     * Confirm a contact by validating their TOTP passcode
     *
     * @param {Contact} contact - Contact to confirm
     * @param {string} passcode - TOTP passcode to validate
     * @param {string} requesterPaymail - Paymail of the person requesting confirmation
     * @param {number} [period=DEFAULT_TOTP_PERIOD] - TOTP period in seconds
     * @param {number} [digits=DEFAULT_TOTP_DIGITS] - Number of digits in TOTP
     * @returns {Promise<void>} True if confirmation successful
     * @throws {ErrorWrongTOTP} If TOTP validation fails
     */
    async confirmContact(
      contact: Contact,
      passcode: string,
      requesterPaymail: string,
      period: number = DEFAULT_TOTP_PERIOD,
      digits: number = DEFAULT_TOTP_DIGITS,
    ): Promise<void> {
      const isTotpValid = this.validateTotpForContact(contact, passcode, requesterPaymail, period, digits);
      if (!isTotpValid) {
        throw new ErrorWrongTOTP();
      }
  
      return await this.http.request(`contacts/${contact.paymail}/confirmation`, 'POST');
    }
  
    /**
     * Remove confirmation status from a contact
     *
     * @param {string} paymail - Paymail address of the contact to unconfirm
     * @returns {Promise<void>}
     */
    async unconfirmContact(paymail: string): Promise<void> {
      return await this.http.request(`contacts/${paymail}/confirmation`, 'DELETE');
    }
  
    /**
     * Accept a contact invitation
     *
     * @param {string} paymail - Paymail address of the contact who sent the invitation
     * @returns {Promise<void>}
     */
    async acceptInvitation(paymail: string): Promise<void> {
      return await this.http.request(`invitations/${paymail}/contacts`, 'POST');
    }
  
    /**
     * Reject a contact invitation
     *
     * @param {string} paymail - Paymail address of the contact whose invitation to reject
     * @returns {Promise<void>}
     */
    async rejectInvitation(paymail: string): Promise<void> {
      return await this.http.request(`invitations/${paymail}/contacts`, 'DELETE');
    }
  
    /**
     * Get shared configuration settings
     *
     * @returns {Promise<SharedConfig>} Shared configuration object
     */
    async sharedConfig(): Promise<SharedConfig> {
      return await this.http.request('configs/shared', 'GET');
    }
  
    /**
     * Draft a new transaction
     *
     * @param {DraftTransactionConfig} config - Configuration for the draft transaction
     * @param {Metadata} metadata - Additional metadata for the transaction
     * @returns {Promise<DraftTx>} The draft transaction
     */
    async draftTransaction(config: DraftTransactionConfig, metadata: Metadata): Promise<DraftTx> {
      return await this.http.request('transactions/drafts', 'POST', {
        config: config,
        metadata,
      });
    }
  
    /**
     * Record a transaction in the system
     *
     * @param {string} hex - Transaction hex
     * @param {string} referenceId - Reference ID (usually draft transaction ID)
     * @param {Metadata} metadata - Additional metadata for the transaction
     * @returns {Promise<Tx>} The recorded transaction
     */
    async recordTransaction(hex: string, referenceId: string, metadata: Metadata): Promise<Tx> {
      return await this.http.request('transactions', 'POST', {
        hex,
        referenceId,
        metadata,
      });
    }
  
    /**
     * Update transaction metadata
     *
     * @param {string} txId - Transaction ID
     * @param {Metadata} metadata - New metadata to update
     * @returns {Promise<Tx>} Updated transaction
     */
    async updateTransactionMetadata(txId: string, metadata: Metadata): Promise<Tx> {
      return await this.http.request(`transactions/${txId}`, 'PATCH', {
        metadata,
      });
    }
  
    /**
     * Get a list of transactions
     *
     * @param {TransactionFilter} conditions - Filter conditions
     * @param {Metadata} metadata - Metadata filter
     * @param {QueryPageParams} queryParams - Pagination parameters
     * @returns {Promise<PageModel<Tx>>} List of transactions
     */
    async transactions(
      conditions: TransactionFilter,
      metadata: Metadata,
      queryParams: QueryPageParams,
    ): Promise<PageModel<Tx>> {
      const basePath = 'transactions';
      const queryString = buildQueryPath({
        filter: conditions,
        metadata: metadata,
        page: queryParams,
      });
  
      return await this.http.request(`${basePath}${queryString}`, 'GET');
    }
  
    /**
     * Get transaction by ID
     *
     * @param {string} id - Transaction ID
     * @returns {Promise<Tx>} Transaction details
     */
    async transaction(id: string): Promise<Tx> {
      return await this.http.request(`transactions/${id}`, 'GET');
    }
  
    /**
     * Finalize a draft transaction by signing it
     *
     * @param {DraftTx} draft - Draft transaction to finalize
     * @returns {Promise<string>} Signed transaction hex
     * @throws {ErrorNoXPrivToSignTransaction} If xPriv is not available
     * @throws {ErrorTxIdsDontMatchToDraft} If transaction IDs don't match
     */
    async finalizeTransaction(draft: DraftTx): Promise<string> {
      if (!this.xPriv) {
        throw new ErrorNoXPrivToSignTransaction();
      }
  
      const txDraft: Transaction = Transaction.fromHex(draft.hex);
  
      draft.configuration.inputs?.forEach((input, index) => {
        const { destination } = input;
        if (destination == null) {
          throw new Error('Unexpected input that does not contain destination which is required for signing');
        }
  
        let hdWallet = this.xPriv!.deriveChild(destination.chain).deriveChild(destination.num);
  
        if (destination.paymailExternalDerivationNum != null) {
          hdWallet = hdWallet.deriveChild(destination.paymailExternalDerivationNum);
        }
  
        if (
          input.transactionId != txDraft.inputs[index].sourceTXID ||
          input.outputIndex != txDraft.inputs[index].sourceOutputIndex
        ) {
          throw new ErrorTxIdsDontMatchToDraft(this.logger, input, index, txDraft.inputs[index]);
        }
  
        txDraft.inputs[index].unlockingScriptTemplate = new P2PKH().unlock(
          hdWallet.privKey,
          'single',
          false,
          input.satoshis,
          new P2PKH().lock(destination.address),
        );
  
        txDraft.inputs[index].sourceOutputIndex = input.outputIndex;
        txDraft.inputs[index].sourceTXID = input.transactionId;
      });
  
      await txDraft.sign();
  
      return txDraft.toHex();
    }
  
    /**
     * Send to recipients (combines draft, sign, and record)
     *
     * @param {DraftTransactionConfig} config - Transaction configuration
     * @param {Metadata} metadata - Transaction metadata
     * @returns {Promise<Tx>} The final transaction
     */
    async sendToRecipients(config: DraftTransactionConfig, metadata: Metadata): Promise<Tx> {
      const draft = await this.draftTransaction(config, metadata);
      const finalized = await this.finalizeTransaction(draft);
      return this.recordTransaction(finalized, draft.id, metadata);
    }
  
    /**
     * Get current user's xPub information
     *
     * @returns {Promise<User>} User information
     */
    async xPub(): Promise<User> {
      return await this.http.request('users/current');
    }
  
    /**
     * Update xPub metadata
     *
     * @param {Metadata} metadata - New metadata to update
     * @returns {Promise<User>} Updated user information
     */
    async updateXPubMetadata(metadata: Metadata): Promise<User> {
      return await this.http.request('users/current', 'PATCH', { metadata });
    }
  
    /**
     * Generate a new access key
     *
     * @param {Metadata} metadata - Metadata for the new access key
     * @returns {Promise<AccessKey>} Generated access key
     */
    async generateAccessKey(metadata: Metadata): Promise<AccessKey> {
      return await this.http.request('users/current/keys', 'POST', { metadata });
    }
  
    /**
     * Get a list of access keys
     *
     * @param {AccessKeyFilter} conditions - Filter conditions for access keys
     * @param {QueryPageParams} queryParams - Pagination parameters
     * @returns {Promise<PageModel<AccessKey>>} List of access keys
     */
    async accessKeys(conditions: AccessKeyFilter, queryParams: QueryPageParams): Promise<PageModel<AccessKey>> {
      const basePath = 'users/current/keys';
      const queryString = buildQueryPath({
        filter: conditions,
        metadata: {},
        page: queryParams,
      });
  
      return await this.http.request(`${basePath}${queryString}`, 'GET');
    }
  
    /**
     * Get a specific access key by ID
     *
     * @param {string} id - Access key ID
     * @returns {Promise<AccessKey>} Access key details
     */
    async accessKey(id: string): Promise<AccessKey> {
      return await this.http.request(`users/current/keys/${id}`);
    }
  
    /**
     * Revoke an access key
     *
     * @param {string} id - ID of the access key to revoke
     * @returns {Promise<void>}
     */
    async revokeAccessKey(id: string): Promise<void> {
      return await this.http.request(`users/current/keys/${id}`, 'DELETE');
    }
  
    /**
     * Get a list of UTXOs
     *
     * @param {UtxoFilter} conditions - Filter conditions for UTXOs
     * @param {Metadata} metadata - Metadata filter
     * @param {QueryPageParams} queryParams - Pagination parameters
     * @returns {Promise<PageModel<Utxo>>} List of UTXOs
     */
    async utxos(conditions: UtxoFilter, metadata: Metadata, queryParams: QueryPageParams): Promise<PageModel<Utxo>> {
      const basePath = 'utxos';
      const queryString = buildQueryPath({
        filter: conditions,
        metadata: metadata,
        page: queryParams,
      });
  
      return await this.http.request(`${basePath}${queryString}`, 'GET');
    }
  
    /**
     * Get merkle roots
     *
     * @param {string} [lastEvaluatedKey] - Last evaluated key for pagination
     * @returns {Promise<ExclusiveStartKeyPage<MerkleRoot[]>>} Page of merkle roots
     */
    async merkleRoots(lastEvaluatedKey?: string): Promise<ExclusiveStartKeyPage<MerkleRoot[]>> {
      const requestPath = 'merkleroots';
      const lastEvaluatedKeyQuery = lastEvaluatedKey ? `?lastEvaluatedKey=${lastEvaluatedKey}` : '';
      return await this.http.request(`${requestPath}${lastEvaluatedKeyQuery}`, 'GET');
    }
  
    /**
     * Sync merkle roots from the client db to the last known block
     *
     * @param {MerkleRootsRepository} repo - Repository interface for merkle root operations
     * @param {number} [timeoutMs] - Optional timeout in milliseconds
     * @throws {ErrorSyncMerkleRootsTimeout} When the sync operation times out
     * @throws {ErrorStaleLastEvaluatedKey} When the last evaluated key becomes stale
     * @returns {Promise<void>}
     */
    async syncMerkleRoots(repo: MerkleRootsRepository, timeoutMs?: number): Promise<void> {
      const startTime = Date.now();
  
      let merkleRootsResponse: ExclusiveStartKeyPage<MerkleRoot[]>;
      let lastEvaluatedKey = await repo.getLastMerkleRoot();
      let previousLastEvaluatedKey = lastEvaluatedKey || null;
      const requestPath = 'merkleroots';
      let lastEvaluatedKeyQuery = '';
  
      if (lastEvaluatedKey) {
        lastEvaluatedKeyQuery = `?lastEvaluatedKey=${lastEvaluatedKey}`;
      }
  
      do {
        if (timeoutMs !== undefined && Date.now() - startTime >= timeoutMs) {
          this.logger.error('SyncMerkleRoots operation timed out');
          throw new ErrorSyncMerkleRootsTimeout();
        }
        merkleRootsResponse = await this.http.request(`${requestPath}${lastEvaluatedKeyQuery}`, 'GET');
  
        if (previousLastEvaluatedKey === merkleRootsResponse.page.lastEvaluatedKey) {
          this.logger.error(
            'The last evaluated key has not changed between requests, indicating a possible loop or synchronization issue.',
          );
          throw new ErrorStaleLastEvaluatedKey();
        }
  
        await repo.saveMerkleRoots(merkleRootsResponse.content);
  
        lastEvaluatedKeyQuery = `?lastEvaluatedKey=${merkleRootsResponse.page.lastEvaluatedKey}`;
        previousLastEvaluatedKey = merkleRootsResponse.page.lastEvaluatedKey;
      } while (previousLastEvaluatedKey !== '');
    }
  
    /**
     * Generate TOTP for a contact
     *
     * @param {Contact} contact - Contact to generate TOTP for
     * @param {number} [period=DEFAULT_TOTP_PERIOD] - TOTP period
     * @param {number} [digits=DEFAULT_TOTP_DIGITS] - Number of TOTP digits
     * @returns {string} Generated TOTP
     * @throws {ErrorNoXPrivToGenerateTOTP} If xPriv is not available
     */
    generateTotpForContact(
      contact: Contact,
      period: number = DEFAULT_TOTP_PERIOD,
      digits: number = DEFAULT_TOTP_DIGITS,
    ): string {
      if (!this.xPriv) {
        throw new ErrorNoXPrivToGenerateTOTP();
      }
      return generateTotpForContact(this.xPriv, contact, period, digits);
    }
  
    validateTotpForContact(
      contact: Contact,
      passcode: string,
      requesterPaymail: string,
      period: number = DEFAULT_TOTP_PERIOD,
      digits: number = DEFAULT_TOTP_DIGITS,
    ): boolean {
      if (!this.xPriv) {
        throw new ErrorNoXPrivToValidateTOTP();
      }
      return validateTotpForContact(this.xPriv, contact, passcode, requesterPaymail, period, digits);
    }
  
    /**
     * Get a list of paymail addresses
     *
     * @param {PaymailFilter} conditions - Filter conditions for paymail addresses
     * @param {Metadata} metadata - Metadata filter
     * @param {QueryPageParams} queryParams - Pagination parameters
     * @returns {Promise<PageModel<PaymailAddress>>} List of paymail addresses
     */
    async paymails(
      conditions: PaymailFilter,
      metadata: Metadata,
      queryParams: QueryPageParams,
    ): Promise<PageModel<PaymailAddress>> {
      const basePath = 'paymails';
      const queryString = buildQueryPath({
        filter: conditions,
        metadata,
        page: queryParams,
      });
  
      return await this.http.request(`${basePath}${queryString}`, 'GET');
    }
  }

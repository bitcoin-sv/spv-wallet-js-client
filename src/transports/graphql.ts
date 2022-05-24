import bsv from "bsv";
import { ApolloClient, ApolloLink, concat, gql } from '@apollo/client/core';
import { InMemoryCache } from '@apollo/client/cache';
import { HttpLink } from '@apollo/client/link/http';
import { print } from 'graphql/language/printer';
import {
  AuthHeader,
  setSignature,
} from "../authentication";
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
} from "../interface";

export const getGraphQLMiddleware = function(options: ClientOptions) {
  return new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    const {query, variables, operationName} = operation;
    const payload = {
      variables,
      operationName,
      query: print(query)
    }

    operation.setContext(({headers = {}}) => {
      if (options.signRequest && (options.xPriv || options.accessKey)) {
        // @ts-ignore
        headers = setSignature(headers, options.xPriv || options.accessKey, JSON.stringify(payload));
      } else {
        headers = { ...headers, [AuthHeader]: options.xPubString};
      }

      return {
        headers,
      };
    });

    return forward(operation);
  })
}

class TransportGraphQL implements TransportService {
  client: ApolloClient<object>
  adminClient: ApolloClient<object> | undefined
  serverUrl: string;
  options: ClientOptions;

  constructor(serverUrl: string, options: ClientOptions) {
    this.serverUrl = serverUrl;
    const httpLink = new HttpLink({ uri: serverUrl });
    const authMiddleware = getGraphQLMiddleware(options);

    // Initialize Apollo Client
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: concat(authMiddleware, httpLink),
    });

    this.options = options;
  }

  SetAdminKey(adminKey: bsv.HDPrivateKey | string): void {
    let adminXpriv;
    if (typeof adminKey === "string") {
      this.options.adminKey = adminKey;
      adminXpriv = bsv.HDPrivateKey.fromString(adminKey);
    } else {
      adminXpriv = adminKey;
      this.options.adminKey = adminKey.toString();
    }

    const adminXPub = adminXpriv.hdPublicKey;
    const adminXPubString = adminXPub.toString();

    const httpLink = new HttpLink({ uri: this.serverUrl });
    const adminAuthMiddleware = getGraphQLMiddleware({
      ...this.options,
      xPriv: adminXpriv,
      xPrivString: this.options.adminKey,
      xPub: adminXPub,
      xPubString: adminXPubString
    });

    // Initialize Apollo Client
    this.adminClient = new ApolloClient({
      cache: new InMemoryCache(),
      link: concat(adminAuthMiddleware, httpLink),
    });
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
    const query = gql`
      query {
        admin_get_status
      }`;
    const variables = {};

    return this.doGraphQLAdminQuery(query, variables, 'admin_get_status');
  }

  async AdminGetStats(): Promise<AdminStats> {
    const query = gql`
      query {
        admin_get_stats {
          balance
          destinations
          transactions
          paymails
          utxos
          xpubs
          transactions_per_day
          utxos_per_type
        }
      }`;
    const variables = {};

    return this.doGraphQLAdminQuery(query, variables, 'admin_get_stats');
  }

  async AdminGetAccessKeys(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<AccessKeys> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata, $params: QueryParams) {
        admin_access_keys_list (
          conditions: $conditions
          metadata: $metadata
          params: $params
        ) {
          id
          xpub_id
          key
          metadata
          created_at
          updated_at
          deleted_at
          revoked_at
        }
      }`;
    const variables = { conditions, metadata, params: queryParams };

    return this.doGraphQLAdminQuery(query, variables, 'admin_access_keys_list');
  }

  async AdminGetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return this.adminCount(conditions, metadata, 'admin_access_keys_count');
  }

  async AdminGetBlockHeaders(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<BlockHeaders> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata, $params: QueryParams) {
        admin_block_headers_list (
          conditions: $conditions
          metadata: $metadata
          params: $params
        ) {
          id
          height
          time
          nonce
          version
          hash_previous_block
          hash_merkle_root
          bits
          synced
          created_at
          updated_at
          deleted_at
        }
      }`;
    const variables = { conditions, metadata, params: queryParams };

    return this.doGraphQLAdminQuery(query, variables, 'admin_block_headers_list');
  }

  async AdminGetBlockHeadersCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return this.adminCount(conditions, metadata, 'admin_block_headers_count');
  }

  async AdminGetDestinations(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Destinations> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata, $params: QueryParams) {
        admin_destinations_list (
          conditions: $conditions
          metadata: $metadata
          params: $params
        ) {
          id
          xpub_id
          locking_script
          type
          chain
          num
          address
          draft_id
          metadata
          created_at
          updated_at
          deleted_at
        }
      }`;
    const variables = { conditions, metadata, params: queryParams };

    return this.doGraphQLAdminQuery(query, variables, 'admin_destinations_list');
  }

  async AdminGetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return this.adminCount(conditions, metadata, 'admin_destinations_count');
  }

  async AdminGetPaymail(address: string): Promise<PaymailAddress> {
    const query = gql`
      query ($address: String!) {
        admin_paymail_get (
          address: $address
        ) {
          id
          xpub_id
          alias
          domain
          public_name
          avatar
          created_at
          updated_at
          deleted_at
        }
      }`;
    const variables = { address };

    return this.doGraphQLAdminQuery(query, variables, 'admin_paymail_get');
  }

  async AdminGetPaymails(conditions: Conditions, metadata: Metadata): Promise<PaymailAddresses> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata) {
        admin_paymails_list (
          conditions: $conditions
          metadata: $metadata
        ) {
          id
          xpub_id
          alias
          domain
          public_name
          avatar
          created_at
          updated_at
          deleted_at
        }
      }`;
    const variables = { conditions, metadata };

    return this.doGraphQLAdminQuery(query, variables, 'admin_paymails_list');
  }

  async AdminGetPaymailsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return this.adminCount(conditions, metadata, 'admin_paymails_count');
  }

  async AdminCreatePaymail(xpub_id: string, address: string, public_name: string, avatar: string): Promise<PaymailAddress> {
    const query = gql`
      mutation (
        $xpub_id: String!
        $address: String!
        $public_name: String!
        $avatar: String!
      ) {
        admin_paymail_create (
          xpub_id: $xpub_id
          address: $address
          public_name: $public_name
          avatar: $avatar
        ) {
          id
          xpub_id
          alias
          domain
          public_name
          avatar
          created_at
          updated_at
          deleted_at
        }
      }`;
    const variables = { xpub_id, address, public_name, avatar };

    return this.doGraphQLAdminMutation(query, variables, 'admin_paymail_create');
  }

  async AdminDeletePaymail(address: string): Promise<PaymailAddress> {
    const query = gql`
      mutation (
        $address: String!
      ) {
        admin_paymail_delete (
          address: $address
        )
      }`;
    const variables = { address };

    return this.doGraphQLAdminMutation(query, variables, 'admin_paymail_delete');
  }

  async AdminGetTransactions(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Transactions> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata, $params: QueryParams) {
        admin_transactions_list (
          conditions: $conditions
          metadata: $metadata
          params: $params
        ) {
          id
          hex
          block_hash
          block_height
          fee
          number_of_inputs
          number_of_outputs
          output_value
          total_value
          metadata
          created_at
          updated_at
          deleted_at
        }
      }`;
    const variables = { conditions, metadata, params: queryParams };

    return this.doGraphQLAdminQuery(query, variables, 'admin_transactions_list');
  }

  async AdminGetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return this.adminCount(conditions, metadata, 'admin_transactions_count');
  }

  async AdminGetUtxos(conditions: Conditions, metadata: Metadata, queryParams: QueryParams): Promise<Utxos> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata, $params: QueryParams) {
        admin_utxos_list (
          conditions: $conditions
          metadata: $metadata
          params: $params
        ) {
          id
          xpub_id
          satoshis
          script_pub_key
          type
          draft_id
          reserved_at
          spending_tx_id
          created_at
          updated_at
          deleted_at
        }
      }`;
    const variables = { conditions, metadata, params: queryParams };

    return this.doGraphQLAdminQuery(query, variables, 'admin_utxos_list');
  }

  async AdminGetUtxosCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return this.adminCount(conditions, metadata, 'admin_utxos_count');
  }

  async AdminGetXPubs(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<XPubs> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata, $params: QueryParams) {
        admin_xpubs_list (
          conditions: $conditions
          metadata: $metadata
          params: $params
        ) {
          id
          current_balance
          next_internal_num
          next_external_num
          metadata
          created_at
          updated_at
          deleted_at
        }
      }`;
    const variables = { conditions, metadata, params };

    return this.doGraphQLAdminQuery(query, variables, 'admin_xpubs_list');
  }

  async AdminGetXPubsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    return this.adminCount(conditions, metadata, 'admin_xpubs_count');
  }

  // Get a new destination to receive funds on
  async GetXPub(): Promise<XPub> {
    const query = gql`
      query {
        xpub {
          id
          current_balance
          next_internal_num
          next_external_num
          metadata
          created_at
          updated_at
          deleted_at
        }
      }`;
    const variables = {};

    return this.doGraphQLQuery(query, variables, 'xpub');
  }

  // UpdateXPubMetadata update the metadata of the logged in xpub
  async UpdateXPubMetadata(metadata: Metadata): Promise<XPub> {
    const query = gql`
    mutation ($metadata: Metadata!) {
  	  xpub_metadata (
  	    metadata: $metadata
  	  ) {
		    id
		    current_balance
		    next_internal_num
		    next_external_num
		    metadata
		    created_at
		    updated_at
		    deleted_at
	    }
	  }`
    const variables = {
      metadata,
    };

    return this.doGraphQLMutation(query, variables, 'xpub_metadata');
  }

  // Get a single access key by ID
  async GetAccessKey(id: string): Promise<AccessKey> {
    const query = gql`
      query ($id: String) {
        access_key (
          id: $id
        ) {
          id
          xpub_id
          key
          metadata
          created_at
          updated_at
          deleted_at
          revoked_at
        }
      }`;
    const variables = { id };

    return this.doGraphQLQuery(query, variables, 'access_key');
  }

  // Get all access keys for the xpub
  async GetAccessKeys(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<AccessKeys> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata, $params: QueryParams) {
        access_keys (
          conditions: $conditions
          metadata: $metadata
          params: $params
        ) {
          id
          xpub_id
          key
          metadata
          created_at
          updated_at
          deleted_at
          revoked_at
        }
      }`;
    const variables = { conditions, metadata, params };

    return this.doGraphQLQuery(query, variables, 'access_keys');
  }

  // Get all access keys for the xpub
  async GetAccessKeysCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata) {
        access_keys_count (
          conditions: $conditions
          metadata: $metadata
        )
      }`;
    const variables = { conditions, metadata };

    return this.doGraphQLQuery(query, variables, 'access_keys_count');
  }

  // Create a new access key for the xpub
  async CreateAccessKey(metadata: Metadata): Promise<AccessKey> {
    const query = gql`
      mutation ($metadata: Metadata) {
        access_key (
          metadata: $metadata
        ) {
          id
          xpub_id
          key
          metadata
          created_at
          updated_at
          deleted_at
          revoked_at
        }
      }`;
    const variables = { metadata };

    return this.doGraphQLMutation(query, variables, 'access_key');
  }

  // Revoke the access key with the given id
  async RevokeAccessKey(id: string): Promise<AccessKey> {
    const query = gql`
      mutation ($id: String) {
        access_key_revoke (
          id: $id
        ) {
          id
          xpub_id
          key
          metadata
          created_at
          updated_at
          deleted_at
          revoked_at
        }
      }`;
    const variables = { id };

    return this.doGraphQLMutation(query, variables, 'access_key_revoke');
  }

  async GetDestinationByID(id: string): Promise<Destination> {
    const query = gql`
      {
        destination (
          id: "${id}"
        ) {
          id
          xpub_id
          locking_script
          type
          chain
          num
          address
          metadata
          created_at
          updated_at
          deleted_at
        }
      }
    `;

    return this.doGraphQLQuery(query, {}, 'destination');
  }

  async GetDestinationByLockingScript(locking_script: string): Promise<Destination> {
    const query = gql`
      {
        destination (
          locking_script: "${locking_script}"
        ) {
          id
          xpub_id
          locking_script
          type
          chain
          num
          address
          metadata
          created_at
          updated_at
          deleted_at
        }
      }
    `;

    return this.doGraphQLQuery(query, {}, 'destination');
  }

  async GetDestinationByAddress(address: string): Promise<Destination> {
    const query = gql`
      {
        destination (
          address: "${address}"
        ) {
          id
          xpub_id
          locking_script
          type
          chain
          num
          address
          metadata
          created_at
          updated_at
          deleted_at
        }
      }
    `;

    return this.doGraphQLQuery(query, {}, 'destination');
  }

  async GetDestinations(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Destinations> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata, $params: QueryParams) {
        destinations (
          conditions: $conditions
          metadata: $metadata
          params: $params
        ) {
          id
          xpub_id
          locking_script
          type
          chain
          num
          address
          metadata
          created_at
          updated_at
          deleted_at
        }
      }
    `;
    const variables = { conditions, metadata, params };

    return this.doGraphQLQuery(query, variables, 'destinations');
  }

  async GetDestinationsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata) {
        destinations_count (
          conditions: $conditions
          metadata: $metadata
        )
      }
    `;
    const variables = { conditions, metadata };

    return this.doGraphQLQuery(query, variables, 'destinations_count');
  }

  // Create a new destination to receive funds on
  async NewDestination(metadata: Metadata): Promise<Destination> {
    const query = gql`
      mutation ($metadata: Metadata) {
        destination (
          metadata: $metadata
        ) {
          id
          xpub_id
          locking_script
          type
          chain
          num
          address
          metadata
        }
      }`;
    const variables = { metadata };

    return this.doGraphQLMutation(query, variables, 'destination');
  }

  // UpdateDestinationMetadataByID updates the destination metadata by id
  async UpdateDestinationMetadataByID(id: string, metadata: Metadata): Promise<Destination> {
    const query = gql`
      mutation ($id: String, $metadata: Metadata!) {
  	    destination_metadata (
		      id: $id
  	      metadata: $metadata
  	    ) {
          id
          xpub_id
          locking_script
          type
          chain
          num
          address
          metadata
          created_at
          updated_at
          deleted_at
        }
      }
    `;
    const variables = {
      id,
      metadata,
    };

    return this.doGraphQLMutation(query, variables, 'destination_metadata');
  }

  // UpdateDestinationMetadataByAddress updates the destination metadata by address
  async UpdateDestinationMetadataByAddress(address: string, metadata: Metadata): Promise<Destination> {
    const query = gql`
      mutation ($address: String, $metadata: Metadata!) {
  	    destination_metadata (
		      address: $address
  	      metadata: $metadata
  	    ) {
          id
          xpub_id
          locking_script
          type
          chain
          num
          address
          metadata
          created_at
          updated_at
          deleted_at
        }
      }
    `;
    const variables = {
      address,
      metadata,
    };

    return this.doGraphQLMutation(query, variables, 'destination_metadata');
  }

  // UpdateDestinationMetadataByLockingScript updates the destination metadata by lockingScript
  async UpdateDestinationMetadataByLockingScript(lockingScript: string, metadata: Metadata): Promise<Destination> {
    const query = gql`
      mutation ($lockingScript: String, $metadata: Metadata!) {
  	    destination_metadata (
		      lockingScript: $lockingScript
  	      metadata: $metadata
  	    ) {
          id
          xpub_id
          locking_script
          type
          chain
          num
          address
          metadata
          created_at
          updated_at
          deleted_at
        }
      }
    `;
    const variables = {
      lockingScript,
      metadata,
    }

    return this.doGraphQLMutation(query, variables, 'destination_metadata');
  }

  async GetTransaction(txID: string): Promise<Transaction> {
    const query = gql`
      {
        transaction (
          id:"${txID}"
        ) {
          id
          hex
          block_hash
          block_height
          fee
          number_of_inputs
          number_of_outputs
          output_value
          total_value
          direction
          metadata
          created_at
          updated_at
          deleted_at
        }
      }
    `;

    return this.doGraphQLQuery(query, {}, 'transaction');
  }

  async GetTransactions(conditions: Conditions, metadata: Metadata, params: QueryParams): Promise<Transactions> {
    const query = gql`
        query ($conditions: Map, $metadata: Metadata, $params: QueryParams) {
          transactions (
            conditions: $conditions
            metadata: $metadata
            params: $params
          ) {
            id
            hex
            block_hash
            block_height
            fee
            number_of_inputs
            number_of_outputs
            output_value
            total_value
            direction
            metadata
            created_at
            updated_at
            deleted_at
          }
        }
      `;

    const variables = {
      conditions,
      metadata,
      params,
    };

    return this.doGraphQLQuery(query, variables, 'transactions');
  }

  async GetTransactionsCount(conditions: Conditions, metadata: Metadata): Promise<number> {
    const query = gql`
        query ($conditions: Map, $metadata: Metadata) {
          transactions_count (
            conditions: $conditions
            metadata: $metadata
          )
        }
      `;

    const variables = {
      conditions,
      metadata,
    };

    return this.doGraphQLQuery(query, variables, 'transactions_count');
  }

  async DraftToRecipients(recipients: Recipients, metadata: Metadata): Promise<DraftTransaction> {
    const query = gql`
        mutation ($outputs: [TransactionOutputInput]!, $metadata: Metadata) {
          new_transaction (
            transaction_config: {
              outputs: $outputs
              change_number_of_destinations: 3
              change_destinations_strategy: "random"
            }
            metadata:$metadata
          ) ${graphqlDraftTransactionFields} 
        }`;
    const variables = { outputs: recipients, metadata }

    return this.doGraphQLMutation(query, variables, 'new_transaction');
  }

  async DraftTransaction(transactionConfig: TransactionConfigInput, metadata: Metadata): Promise<DraftTransaction> {
    const query = gql`
      mutation ($transactionConfig: TransactionConfigInput!, $metadata: Metadata) {
        new_transaction(
          transaction_config: $transactionConfig
          metadata: $metadata
        ) ` + graphqlDraftTransactionFields + `
      }`;
    const variables = { transactionConfig, metadata }

    return this.doGraphQLMutation(query, variables, 'new_transaction');
  }

  async RecordTransaction(hex: string, referenceID: string, metadata: Metadata): Promise<Transaction> {
    const query = gql`
      mutation($hex: String!, $referenceID: String, $metadata: Metadata) {
        transaction(
          hex: $hex
          draft_id: $referenceID
          metadata: $metadata
        ) {
          id
          hex
          block_hash
          block_height
          fee
          number_of_inputs
          number_of_outputs
          output_value
          total_value
          direction
          metadata
          created_at
          updated_at
          deleted_at
        }
      }`;
    const variables = { hex, referenceID, metadata }

    return this.doGraphQLMutation(query, variables, 'transaction');
  }

  async UpdateTransactionMetadata(txID: string, metadata: Metadata): Promise<Transaction> {
    const query = gql`
      mutation ($id: String!, $metadata: Metadata!) {
        transaction_metadata (
          id: $id
          metadata: $metadata
      ) {
          id
          hex
          block_hash
          block_height
          fee
          number_of_inputs
          number_of_outputs
          output_value
          total_value
          direction
          metadata
          created_at
          updated_at
          deleted_at
        }
      }
	  `;
    const variables = {
      id: txID,
      metadata,
    }

    return this.doGraphQLMutation(query, variables, 'transaction_metadata');
  }

  async RegisterXpub(rawXPub: string, metadata: Metadata): Promise<XPub> {
    const query = gql`
      mutation ($xpub: String!, $metadata: Metadata) {
        xpub(
          xpub: $xpub
          metadata: $metadata
        ) {
          id
        }
      }`;
    const variables = { xpub: rawXPub, metadata }

    return this.doGraphQLAdminMutation(query, variables, 'xpub');
  }

  async RegisterXpubWithToken(rawXPub: string, token: string, metadata: Metadata): Promise<XPub> {
    const query = gql`
      mutation ($xpub: String!, $token: String!, $metadata: Metadata) {
        xpub_with_token(
          xpub: $xpub
          token: $token
          metadata: $metadata
        ) {
          id
        }
      }`;
    const variables = { xpub: rawXPub, token, metadata }

    return this.doGraphQLMutation(query, variables, 'xpub_with_token');
  }

  private adminCount(conditions: Conditions, metadata: Metadata, method: string) {
    const query = gql`
      query ($conditions: Map, $metadata: Metadata) {
        ${method} (
          conditions: $conditions
          metadata: $metadata
        )
      }`;
    const variables = { conditions, metadata };

    return this.doGraphQLAdminQuery(query, variables, method);
  }

  private async doGraphQLQuery(query: any, variables: any, resultId: string) {
    return this.doGraphQLClientQuery(this.client, query, variables, resultId);
  }

  private async doGraphQLMutation(query: any, variables: any, resultId: string) {
    return this.doGraphQLClientMutate(this.client, query, variables, resultId);
  }

  private async doGraphQLAdminQuery(query: any, variables: any, resultId: string) {
    if (!this.adminClient) {
      throw new Error("Admin key has not been set. Cannot do admin queries");
    }

    return this.doGraphQLClientQuery(this.adminClient, query, variables, resultId);
  }

  private async doGraphQLAdminMutation(query: any, variables: any, resultId: string) {
    if (!this.adminClient) {
      throw new Error("Admin key has not been set. Cannot do admin queries");
    }

    return this.doGraphQLClientMutate(this.adminClient, query, variables, resultId);
  }

  private async doGraphQLClientQuery(client: ApolloClient<object>, query: any, variables: any, resultId: string) {
    const { error, data } = await client.query({
      query,
      variables,
    }).catch(e => {
      throw new Error(e);
    });

    if (error) {
      throw new Error(error.message);
    }

    return data[resultId];
  }

  private async doGraphQLClientMutate(client: ApolloClient<object>, query: any, variables: any, resultId: string) {
    const { data } = await client.mutate({
      mutation: query,
      variables,
    }).catch(e => {
      throw new Error(e);
    });

    return data[resultId];
  }
}

export default TransportGraphQL

const graphqlDraftTransactionFields = `{
id
xpub_id
configuration {
  inputs {
	  id
	  satoshis
	  transaction_id
	  output_index
	  script_pub_key
	  destination {
  	  id
  	  address
  	  type
  	  num
  	  chain
  	  locking_script
  	}
  }
  outputs {
	  to
	  satoshis
	  scripts {
  	  address
	    satoshis
	    script
	  }
	  paymail_p4 {
  	  alias
	    domain
  	  from_paymail
  	  note
  	  pub_key
  	  receive_endpoint
      reference_id
	    resolution_type
	  }
  }
  change_destinations {
	  address
	  chain
	  num
	  locking_script
	  draft_id
  }
  change_satoshis
  fee
}
status
expires_at
hex
}`;

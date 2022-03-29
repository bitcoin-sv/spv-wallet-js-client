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
  ClientOptions,
  Conditions,
  Destination,
  Destinations,
  DraftTransaction,
  Metadata,
  Recipients,
  Transaction,
  TransactionConfigInput,
  Transactions,
  TransportService,
  XPub,
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

  SetAdminKey(adminKey: string): void {
    this.options.adminKey = adminKey;
    const adminXpriv = bsv.HDPrivateKey.fromString(adminKey);
    const adminXPub = adminXpriv.hdPublicKey;
    const adminXPubString = adminXPub.toString();

    const httpLink = new HttpLink({ uri: this.serverUrl });
    const adminAuthMiddleware = getGraphQLMiddleware({
      ...this.options,
      xPriv: adminXpriv,
      xPrivString: adminKey,
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
  async GetAccessKeys(metadata: Metadata): Promise<AccessKeys> {
    const query = gql`
      query ($metadata: Metadata) {
        access_keys (
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

    return this.doGraphQLQuery(query, variables, 'access_keys');
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

  async GetDestinations(metadata: Metadata): Promise<Destinations> {
    const query = gql`
      query ($metadata: Metadata) {
        destinations (
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
    const variables = { metadata };

    return this.doGraphQLQuery(query, variables, 'destinations');
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

  async GetTransactions(conditions: Conditions, metadata: Metadata): Promise<Transactions> {
    const query = gql`
        query ($conditions: Map, $metadata: Metadata) {
          transactions (
            conditions: $conditions
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
      conditions,
      metadata,
    };

    return this.doGraphQLQuery(query, variables, 'transactions');
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

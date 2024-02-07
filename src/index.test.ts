import { describe, expect, test } from '@jest/globals'
import axios from "axios"
import MockAdapter from "axios-mock-adapter"

import { BuxClient } from "./index";
import {
  ClientOptions,
  DraftTransaction,
  TransactionConfigInput,
  Recipients
} from "./interface";

const xPrivString = "xprv9s21ZrQH143K49XnCBsjkh7Lqt2Je9iCXBqCUp6xUvb2jCGyeShuqMLiG5Ro6JggbKaud4sg1PmgYGptKTc2FhA3SEGCcaeiTESNDp1Vj2A"
const xPubString = "xpub661MyMwAqRbcGdcFJDQk7q45Puro3cS3tQkoHCWa3G81bzc8Bz2AP9fC7MT4SfsbPfCie1fR1o8VPf735w3ZeEmvDF6AMQifS3FfeUfrDS7"
const serverURL = "https://bux.org/v1"
const draftTxJSON = `{"created_at":"2022-02-09T16:28:39.000639Z","updated_at":"0001-01-01T00:00:00Z","deleted_at":null,"id":"fe6fe12c25b81106b7332d58fe87dab7bc6e56c8c21ca45b4de05f673f3f653c","hex":"010000000141e3be4d5a3f25e11157bfdd100e7c3497b9be2b80b57eb55e5376b075e7dc5d0200000000ffffffff02e8030000000000001976a9147ff514e6ae3deb46e6644caac5cdd0bf2388906588ac170e0000000000001976a9143dbdb346aaf1c3dc501a2f8c186c3d3e8a87764588ac00000000","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","expires_at":"2022-02-09T16:29:08.991801Z","metadata":{"testkey":"test-value"},"configuration":{"change_destinations":[{"created_at":"2022-02-09T16:28:38.997313Z","updated_at":"0001-01-01T00:00:00Z","deleted_at":null,"id":"252e8a915a5f05effab827a887e261a2416a76f3d3aada946a70a575c0bb76a7","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","locking_script":"76a9143dbdb346aaf1c3dc501a2f8c186c3d3e8a87764588ac","type":"pubkeyhash","chain":1,"num":100,"address":"16dTUJwi7qT3JqzAUMcDHaVV3sB4fH85Ep","draft_id":"fe6fe12c25b81106b7332d58fe87dab7bc6e56c8c21ca45b4de05f673f3f653c"}],"change_destinations_strategy":"","change_minimum_satoshis":0,"change_number_of_destinations":0,"change_satoshis":3607,"expires_in":0,"fee":97,"fee_unit":{"satoshis":1,"bytes":2},"from_utxos":null,"inputs":[{"created_at":"2022-01-28T13:45:02.352Z","updated_at":"2022-02-09T16:28:38.993207Z","deleted_at":null,"id":"efe383eea1a6f7925afb2621b69ea9ba6bd0623e8d61827bad994f8be85161fc","transaction_id":"5ddce775b076535eb57eb5802bbeb997347c0e10ddbf5711e1253f5a4dbee341","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","output_index":2,"satoshis":4704,"script_pub_key":"76a914c746bf0f295375cbea4a5ef25b36c84ff9801bac88ac","type":"pubkeyhash","draft_id":"fe6fe12c25b81106b7332d58fe87dab7bc6e56c8c21ca45b4de05f673f3f653c","reserved_at":"2022-02-09T16:28:38.993205Z","spending_tx_id":null,"destination":{"created_at":"2022-01-28T13:45:02.324Z","updated_at":"0001-01-01T00:00:00Z","metadata":{"client_id":"8","run":90,"run_id":"3108aa426fc7102488bb0ffd","xbench":"destination for testing"},"deleted_at":null,"id":"b8bfa56e37c90f1b25df2e571f727cfec80dd17c5d1845c4b93e21034f7f6a0b","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","locking_script":"76a914c746bf0f295375cbea4a5ef25b36c84ff9801bac88ac","type":"pubkeyhash","chain":0,"num":212,"address":"1KAgDiUasnC7roCjQZM1XLJUpq4BYHjdp6","draft_id":""}}],"miner":"","outputs":[{"satoshis":1000,"scripts":[{"address":"1CfaQw9udYNPccssFJFZ94DN8MqNZm9nGt","satoshis":1000,"script":"76a9147ff514e6ae3deb46e6644caac5cdd0bf2388906588ac","script_type":"pubkeyhash"}],"to":"1CfaQw9udYNPccssFJFZ94DN8MqNZm9nGt","op_return":null},{"satoshis":3607,"scripts":[{"address":"16dTUJwi7qT3JqzAUMcDHaVV3sB4fH85Ep","satoshis":3607,"script":"76a9143dbdb346aaf1c3dc501a2f8c186c3d3e8a87764588ac","script_type":""}],"to":"16dTUJwi7qT3JqzAUMcDHaVV3sB4fH85Ep","op_return":null}],"send_all_to":"","sync":null},"status":"draft"}`
const draftTxJSON2 = `{"id":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","configuration":{"inputs":[{"id":"6f893de42f8642c6e5b58f427bfe7fe36498a854f4b7439b0f6399a6f34fd680","satoshis":2395,"transaction_id":"57c3883b3538de4419bde571bad3aa22577b911f48be38873711a565170a2e75","output_index":1,"script_pub_key":"76a9149e8bb81cc5d3aeca52f7221e2701fd3972c6245088ac","destination":{"id":"897b2f7e2c7258fc767600f61420ed30b4cad8e060e3a920e0540d71fe3fa0be","address":"1FTK9AnLoWdc9uPpg3WQqh9ApPWRe48zRp","type":"pubkeyhash","num":213,"chain":0,"locking_script":"76a9149e8bb81cc5d3aeca52f7221e2701fd3972c6245088ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"597a666b25bfb55b5b077f54ad64e8f302ce1fbeae3a97d41148f2f285811537","satoshis":3946,"transaction_id":"480e10635efb96664ea90843820ef5b0db743b9a67e16857633f9be305ed3d24","output_index":1,"script_pub_key":"76a9146fe3504de216287a481c10174a6f61944f16de8a88ac","destination":{"id":"c973d543bd78060ac519b757291e798cc5bceb371e16fa90b5f968d7896f5ff8","address":"1BCcKKrkhKe2JyArhJATb3Jg5cVtBE7fGi","type":"pubkeyhash","num":214,"chain":0,"locking_script":"76a9146fe3504de216287a481c10174a6f61944f16de8a88ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"51396f86afed1be9a0881da62440937697325e19ac9cccfc8d0444174a9e1ca7","satoshis":1607,"transaction_id":"76bffaf1647f529431b714d8076e42e7a4b957fdb78d28812d329134e8e9d901","output_index":1,"script_pub_key":"76a914b0af70b7b2ce999854f8a03b55fbe176e1476a2b88ac","destination":{"id":"0da19093bd6980cbd8262345ad68875960a132cec93e620d219d81c95de7275a","address":"1H7E6Zx7u24yMY8fKmvxrz5XBveK5D3azX","type":"pubkeyhash","num":215,"chain":0,"locking_script":"76a914b0af70b7b2ce999854f8a03b55fbe176e1476a2b88ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"0342f3901285cb4acae7f2682734e70bbccbe07f3d1de723a2e791fd25fbc868","satoshis":5278,"transaction_id":"76bffaf1647f529431b714d8076e42e7a4b957fdb78d28812d329134e8e9d901","output_index":3,"script_pub_key":"76a914c737741c218bea665772d784505911baf37f1da588ac","destination":{"id":"f4323a62ada45e8818cde382ca60ff411eaad89dbfb6e0ffaee34cf3e7000ab4","address":"1KAMu9yaYFmARwkmff4mehtPURJezFfciy","type":"pubkeyhash","num":216,"chain":0,"locking_script":"76a914c737741c218bea665772d784505911baf37f1da588ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"ad4e8387285861253b9090826328ceb486fc296d02446998e02c07725ed6be71","satoshis":985,"transaction_id":"819a20cc0f5a0c0d0e155984bc247915b6bd5708933c5bb56613ce751531b876","output_index":3,"script_pub_key":"76a91472affcedae840864b53b2f1935ffe69b564de73588ac","destination":{"id":"ed71cddcd8513d727cbe4c4f97d0bb0c3d292a068058ab63515242c772557f8a","address":"1BTQrjJh9HsvG6eEkFeW3bqqyJTEveXtqd","type":"pubkeyhash","num":90,"chain":1,"locking_script":"76a91472affcedae840864b53b2f1935ffe69b564de73588ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"c0d24c7c3779c5e605bca94629f427c217c2f87a7dbe251576751424b164874e","satoshis":4131,"transaction_id":"0f43d147679bdd181e87c8701309068f7457989e8583fd2a2059134157418b14","output_index":2,"script_pub_key":"76a914613234b0f125f8eab12231c484c066bcedb690c788ac","destination":{"id":"be318b2f9539290e5e546702223411d9683bcfc5bb5402635399e2158932d59c","address":"19rvgyE8iuPMqn7SYziid51ZchMCMHTQ3i","type":"pubkeyhash","num":217,"chain":0,"locking_script":"76a914613234b0f125f8eab12231c484c066bcedb690c788ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"2cc9644e19b51fd81540ac704a9264388f06fd6a82516a99b41a1192eb4bff97","satoshis":3017,"transaction_id":"6aca717e106ff6ac62f69211f9fda02c183c15bc2b31f4a0e86c53a29d27b5b3","output_index":0,"script_pub_key":"76a914964a1931261d04566c8c70b94f48cd176928c01788ac","destination":{"id":"cd49ffcd80de77e614f63560b732cb5186f9753914adc24864cee72e959653d9","address":"1Ehf8Dt6JNKC7KQdpVzEQhGp23JqJgvvTC","type":"pubkeyhash","num":220,"chain":0,"locking_script":"76a914964a1931261d04566c8c70b94f48cd176928c01788ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"09ed535a5ea8851e887c227782777be6db5e8f3eafe4b191b87651249d940a5d","satoshis":99881732,"transaction_id":"6aca717e106ff6ac62f69211f9fda02c183c15bc2b31f4a0e86c53a29d27b5b3","output_index":3,"script_pub_key":"76a914a83b90f55720e9055e0a2281b3ac0e8b312f7ea588ac","destination":{"id":"1a0ca2c18432c90d257688a16be40d4bb0195df0cad8193e155ac3e48c90102a","address":"1GLXsxqRxPpXsQsU3zeYs7UrrtcZ5QVVsX","type":"pubkeyhash","num":91,"chain":1,"locking_script":"76a914a83b90f55720e9055e0a2281b3ac0e8b312f7ea588ac","__typename":"Destination"},"__typename":"TransactionInput"}],"outputs":[{"to":"1C1tuBodLqmJcy7RH5oQHeBEhGvHhoccSA","satoshis":234423,"scripts":[{"address":"1C1tuBodLqmJcy7RH5oQHeBEhGvHhoccSA","satoshis":234423,"script":"76a91478d4b515b0e9de6fa483889eea9e1285630247ae88ac","__typename":"ScriptOutput"}],"paymail_p4":null,"__typename":"TransactionOutput"},{"to":"18C3n8CDgtxc62b56V1sNorR7wAToF9jLH","satoshis":37018825,"scripts":[{"address":"18C3n8CDgtxc62b56V1sNorR7wAToF9jLH","satoshis":37018825,"script":"76a9144edfc667fab03d524fd96c487262369b12d22a3188ac","__typename":"ScriptOutput"}],"paymail_p4":null,"__typename":"TransactionOutput"},{"to":"18Y9SoziUyrzo2JoNnfwrQhFamvpPkNfhM","satoshis":27051980,"scripts":[{"address":"18Y9SoziUyrzo2JoNnfwrQhFamvpPkNfhM","satoshis":27051980,"script":"76a91452acd3287e875e14e4c9dba8cb0a33e7b1cb3fdd88ac","__typename":"ScriptOutput"}],"paymail_p4":null,"__typename":"TransactionOutput"},{"to":"1K8auRR89TN7AJW1JrgcafBmXhdWXvTxpz","satoshis":35597248,"scripts":[{"address":"1K8auRR89TN7AJW1JrgcafBmXhdWXvTxpz","satoshis":35597248,"script":"76a914c6e17a315b6766b0244e9d54667202730f8dc20888ac","__typename":"ScriptOutput"}],"paymail_p4":null,"__typename":"TransactionOutput"}],"change_destinations":[{"address":"18C3n8CDgtxc62b56V1sNorR7wAToF9jLH","chain":1,"num":112,"locking_script":"76a9144edfc667fab03d524fd96c487262369b12d22a3188ac","draft_id":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","__typename":"Destination"},{"address":"18Y9SoziUyrzo2JoNnfwrQhFamvpPkNfhM","chain":1,"num":113,"locking_script":"76a91452acd3287e875e14e4c9dba8cb0a33e7b1cb3fdd88ac","draft_id":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","__typename":"Destination"},{"address":"1K8auRR89TN7AJW1JrgcafBmXhdWXvTxpz","chain":1,"num":114,"locking_script":"76a914c6e17a315b6766b0244e9d54667202730f8dc20888ac","draft_id":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","__typename":"Destination"}],"change_satoshis":99668053,"fee":615,"__typename":"TransactionConfig"},"status":"draft","expires_at":"2022-03-04T14:26:34.755995Z","hex":"0100000008752e0a1765a511378738be481f917b5722aad3ba71e5bd1944de38353b88c3570100000000ffffffff243ded05e39b3f635768e1679a3b74dbb0f50e824308a94e6696fb5e63100e480100000000ffffffff01d9e9e83491322d81288db7fd57b9a4e7426e07d814b73194527f64f1fabf760100000000ffffffff01d9e9e83491322d81288db7fd57b9a4e7426e07d814b73194527f64f1fabf760300000000ffffffff76b8311575ce1366b55b3c930857bdb6157924bc8459150e0d0c5a0fcc209a810300000000ffffffff148b4157411359202afd83859e9857748f06091370c8871e18dd9b6747d1430f0200000000ffffffffb3b5279da2536ce8a0f4312bbc153c182ca0fdf91192f662acf66f107e71ca6a0000000000ffffffffb3b5279da2536ce8a0f4312bbc153c182ca0fdf91192f662acf66f107e71ca6a0300000000ffffffff04b7930300000000001976a91478d4b515b0e9de6fa483889eea9e1285630247ae88acc9dc3402000000001976a9144edfc667fab03d524fd96c487262369b12d22a3188acccc79c01000000001976a91452acd3287e875e14e4c9dba8cb0a33e7b1cb3fdd88acc02b1f02000000001976a914c6e17a315b6766b0244e9d54667202730f8dc20888ac00000000","__typename":"DraftTransaction"}`

interface TestClient {
  xPrivString: string;
  xPubString: string;
  serverURL: string;
}

const httpTestClient: TestClient = {
  xPrivString,
  xPubString,
  serverURL,
};

const testClient: TestClient = httpTestClient

describe('BuxClient class', () => {
  test('instantiate', () => {
    const options: ClientOptions = {}
    const buxClient = new BuxClient("https://bux.org/v1", options);
    expect(buxClient).toBeInstanceOf(BuxClient);
  });

  test('instantiate with options', () => {
    const options: ClientOptions = {
      adminKey: xPrivString,
      debug: true,
      xPrivString,
      xPubString,
    }
    const buxClient = new BuxClient("https://bux.org/v1", options);
    expect(buxClient).toBeInstanceOf(BuxClient);
  });
});


describe('BuxClient routing', () => {
  const options: ClientOptions = {
    xPrivString: testClient.xPrivString,
    signRequest: true,
  };
  const bux = new BuxClient(testClient.serverURL, options);

  const tcs = [
    { fname: 'GetXpub', routing: 'xpub', httpverb: 'get', fn: () => { return bux.GetXPub() }, },
    { fname: 'UpdateXPubMetadata', routing: 'xpub', httpverb: 'patch', fn: () => { return bux.UpdateXPubMetadata({}) }, },

    { fname: 'GetAccessKey', routing: 'access-key?id=', httpverb: 'get', fn: () => { return bux.GetAccessKey("") }, },
    { fname: 'GetAccessKeys', routing: 'access-key/search', httpverb: 'post', fn: () => { return bux.GetAccessKeys({}, {}, {}) }, },
    { fname: 'GetAccessKeysCount', routing: 'access-key/count', httpverb: 'post', fn: () => { return bux.GetAccessKeysCount({}, {}) }, },
    { fname: 'CreateAccessKey', routing: 'access-key', httpverb: 'post', fn: () => { return bux.CreateAccessKey({}) } },
    { fname: 'RevokeAccessKey', routing: 'access-key?id=', httpverb: 'delete', fn: () => { return bux.RevokeAccessKey("") } },

    { fname: 'GetDestinationByID', routing: 'destination?id=', httpverb: 'get', fn: () => { return bux.GetDestinationByID("") } },
    { fname: 'GetDestinationByLockingScript', routing: 'destination?locking_script=', httpverb: 'get', fn: () => { return bux.GetDestinationByLockingScript("") } },
    { fname: 'GetDestinationByAddress', routing: 'destination?address=', httpverb: 'get', fn: () => { return bux.GetDestinationByAddress("") } },
    { fname: 'GetDestinations', routing: 'destination/search', httpverb: 'post', fn: () => { return bux.GetDestinations({}, {}, {}) } },
    { fname: 'GetDestinationsCount', routing: 'destination/count', httpverb: 'post', fn: () => { return bux.GetDestinationsCount({}, {}) } },

    { fname: 'NewDestination', routing: 'destination', httpverb: 'post', fn: () => { return bux.NewDestination({}) } },
    { fname: 'UpdateDestinationMetadataByID', routing: 'destination', httpverb: 'patch', fn: () => { return bux.UpdateDestinationMetadataByID("", {}) } },
    { fname: 'UpdateDestinationMetadataByLockingScript', routing: 'destination', httpverb: 'patch', fn: () => { return bux.UpdateDestinationMetadataByLockingScript("", {}) } },
    { fname: 'UpdateDestinationMetadataByAddress', routing: 'destination', httpverb: 'patch', fn: () => { return bux.UpdateDestinationMetadataByAddress("", {}) } },

    { fname: 'GetTransaction', routing: 'transaction?id=', httpverb: 'get', fn: () => { return bux.GetTransaction("") } },
    { fname: 'GetTransactions', routing: 'transaction/search', httpverb: 'post', fn: () => { return bux.GetTransactions({}, {}, {}) } },
    { fname: 'GetTransactionsCount', routing: 'transaction/count', httpverb: 'post', fn: () => { return bux.GetTransactionsCount({}, {}) } },

    { fname: 'DraftTransaction', routing: 'transaction', httpverb: 'post', fn: () => { return bux.DraftTransaction({} as TransactionConfigInput, {}) } },
    { fname: 'DraftToRecipients', routing: 'transaction', httpverb: 'post', fn: () => { return bux.DraftToRecipients([] as Recipients, {}) } },
    { fname: 'RecordTransaction', routing: 'transaction/record', httpverb: 'post', fn: () => { return bux.RecordTransaction("", "", {}) } },
    { fname: 'UpdateTransactionMetadata', routing: 'transaction', httpverb: 'patch', fn: () => { return bux.UpdateTransactionMetadata("", {}) } },

    { fname: 'GetUtxo', routing: 'utxo?tx_id=&output_index=0', httpverb: 'get', fn: () => { return bux.GetUtxo("", 0) } },
    { fname: 'GetUtxos', routing: 'utxo/search', httpverb: 'post', fn: () => { return bux.GetUtxos({}, {}, {}) } },
    { fname: 'GetUtxosCount', routing: 'utxo/count', httpverb: 'post', fn: () => { return bux.GetUtxosCount({}, {}) } },

    { fname: 'NewPaymail', routing: 'paymail', httpverb: 'post', fn: () => { return bux.NewPaymail("", "") } },
    { fname: 'DeletePaymail', routing: 'paymail', httpverb: 'delete', fn: () => { return bux.DeletePaymail("") } },
  ]

  tcs.forEach((tc) => {
    test(tc.fname, async () => {
      // given
      const mq = setupHttpMock(tc.httpverb, tc.routing)

      // when
      await tc.fn()

      // then

      // verify the API call was actually made
      expect(mq.history[tc.httpverb].length).toBe(1)

      // expect no exception to be thrown 
    });
  })
});

describe('BuxClient admin routing', () => {
  const options: ClientOptions = {
    adminKey: testClient.xPrivString,
    xPrivString: testClient.xPrivString,
    signRequest: true,
  };
  const adminBux = new BuxClient(testClient.serverURL, options);

  const tcs = [
    { fname: 'RegisterXpub', routing: 'xpub', httpverb: 'post', fn: () => { return adminBux.RegisterXpub("", {}) }, },

    { fname: 'AdminGetStatus', routing: 'admin/status', httpverb: 'get', fn: () => { return adminBux.AdminGetStatus() } },
    { fname: 'AdminGetStats', routing: 'admin/stats', httpverb: 'get', fn: () => { return adminBux.AdminGetStats() } },

    { fname: 'AdminGetAccessKeys', routing: 'admin/access-keys/search', httpverb: 'post', fn: () => { return adminBux.AdminGetAccessKeys({}, {}, {}) } },
    { fname: 'AdminGetAccessKeysCount', routing: 'admin/access-keys/count', httpverb: 'post', fn: () => { return adminBux.AdminGetAccessKeysCount({}, {}) } },

    { fname: 'AdminGetBlockHeaders', routing: 'admin/block-headers/search', httpverb: 'post', fn: () => { return adminBux.AdminGetBlockHeaders({}, {}, {}) } },
    { fname: 'AdminGetBlockHeadersCount', routing: 'admin/block-headers/count', httpverb: 'post', fn: () => { return adminBux.AdminGetBlockHeadersCount({}, {}) } },

    { fname: 'AdminGetDestinations', routing: 'admin/destinations/search', httpverb: 'post', fn: () => { return adminBux.AdminGetDestinations({}, {}, {}) } },
    { fname: 'AdminGetDestinationsCount', routing: 'admin/destinations/count', httpverb: 'post', fn: () => { return adminBux.AdminGetDestinationsCount({}, {}) } },

    { fname: 'AdminGetPaymail', routing: 'admin/paymail/get', httpverb: 'post', fn: () => { return adminBux.AdminGetPaymail("") } },
    { fname: 'AdminGetPaymails', routing: 'admin/paymails/search', httpverb: 'post', fn: () => { return adminBux.AdminGetPaymails({}, {}, {}) } },
    { fname: 'AdminGetPaymailsCount', routing: 'admin/paymails/count', httpverb: 'post', fn: () => { return adminBux.AdminGetPaymailsCount({}, {}) } },
    { fname: 'AdminCreatePaymail', routing: 'admin/paymail/create', httpverb: 'post', fn: () => { return adminBux.AdminCreatePaymail("", "", "", "") } },
    { fname: 'AdminDeletePaymail', routing: 'admin/paymail/delete', httpverb: 'delete', fn: () => { return adminBux.AdminDeletePaymail("") } },

    { fname: 'AdminGetTransactions', routing: 'admin/transactions/search', httpverb: 'post', fn: () => { return adminBux.AdminGetTransactions({}, {}, {}) } },
    { fname: 'AdminGetTransactionsCount', routing: 'admin/transactions/count', httpverb: 'post', fn: () => { return adminBux.AdminGetTransactionsCount({}, {}) } },

    { fname: 'AdminGetUtxos', routing: 'admin/utxos/search', httpverb: 'post', fn: () => { return adminBux.AdminGetUtxos({}, {}, {}) } },
    { fname: 'AdminGetUtxosCount', routing: 'admin/utxos/count', httpverb: 'post', fn: () => { return adminBux.AdminGetUtxosCount({}, {}) } },

    { fname: 'AdminGetXPubs', routing: 'admin/xpubs/search', httpverb: 'post', fn: () => { return adminBux.AdminGetXPubs({}, {}, {}) } },
    { fname: 'AdminGetXPubsCount', routing: 'admin/xpubs/count', httpverb: 'post', fn: () => { return adminBux.AdminGetXPubsCount({}, {}) } },

    { fname: 'AdminRecordTransaction', routing: 'admin/transactions/record', httpverb: 'post', fn: () => { return adminBux.AdminRecordTransaction("") } },
  ]

  tcs.forEach((tc) => {
    test(tc.fname, async () => {
      // given
      const mq = setupHttpMock(tc.httpverb, tc.routing)

      // when
      await tc.fn()

      // then

      // verify the API call was actually made
      expect(mq.history[tc.httpverb].length).toBe(1)

      // expect no exception to be thrown 
    });
  })
});

describe('Finalize transaction', () => {
  test('draftTxJSON', async () => {
    const buxClient = new BuxClient(serverURL, {
      xPrivString,
      signRequest: true,
    });

    const draftTransaction: DraftTransaction = JSON.parse(draftTxJSON);
    const transaction = buxClient.FinalizeTransaction(draftTransaction);
    expect(typeof transaction).toBe('string');
  });

  test('draftTxJSON2', async () => {
    const buxClient = new BuxClient(serverURL, {
      xPrivString,
      signRequest: true,
    });

    const draftTransaction: DraftTransaction = JSON.parse(draftTxJSON2);
    const transaction = buxClient.FinalizeTransaction(draftTransaction);
    expect(typeof transaction).toBe('string');
  });

  test('draftTxJSON2 error', async () => {
    const buxClient = new BuxClient(serverURL, {
      xPrivString,
      signRequest: true,
    });

    const draftTransaction: DraftTransaction = JSON.parse(draftTxJSON2);
    // @ts-ignore
    draftTransaction.configuration.inputs[0].destination.num = 12333;
    expect(() => {
      buxClient.FinalizeTransaction(draftTransaction);
    }).toThrow("transaction could not be fully signed")
  });
});

function setupHttpMock(httpVerb: string, routing: string): MockAdapter {
  const apiCallUrl = `${serverURL}/${routing}`
  const httpMq = new MockAdapter(axios);

  switch (httpVerb) {
    case "get":
      httpMq.onGet(apiCallUrl).reply(200)
      break

    case "patch":
      httpMq.onPatch(apiCallUrl).reply(200)
      break

    case "post":
      httpMq.onPost(apiCallUrl).reply(200)
      break

    case "delete":
      httpMq.onDelete(apiCallUrl).reply(200)
      break
  }

  return httpMq
}

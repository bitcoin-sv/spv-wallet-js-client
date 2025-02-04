import { describe, expect, test } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';
import { NewContact, SPVWalletUserAPI, SPVWalletAdminAPI } from './index';
import { ClientOptions, AdminClientOptions, DraftTx, DraftTransactionConfig } from './types';

const xPrivString =
  'xprv9s21ZrQH143K49XnCBsjkh7Lqt2Je9iCXBqCUp6xUvb2jCGyeShuqMLiG5Ro6JggbKaud4sg1PmgYGptKTc2FhA3SEGCcaeiTESNDp1Vj2A';
const xPubString =
  'xpub661MyMwAqRbcGdcFJDQk7q45Puro3cS3tQkoHCWa3G81bzc8Bz2AP9fC7MT4SfsbPfCie1fR1o8VPf735w3ZeEmvDF6AMQifS3FfeUfrDS7';
const serverURL = 'https://unit-test.local.org/api/v1';
const draftTxJSON = `{"createdAt": "2022-02-09T16:28:39.000639Z", "updatedAt": "0001-01-01T00:00:00Z", "deletedAt": null, "id": "fe6fe12c25b81106b7332d58fe87dab7bc6e56c8c21ca45b4de05f673f3f653c", "hex": "010000000141e3be4d5a3f25e11157bfdd100e7c3497b9be2b80b57eb55e5376b075e7dc5d0200000000ffffffff02e8030000000000001976a9147ff514e6ae3deb46e6644caac5cdd0bf2388906588ac170e0000000000001976a9143dbdb346aaf1c3dc501a2f8c186c3d3e8a87764588ac00000000", "xpubId": "9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36", "expiresAt": "2022-02-09T16:29:08.991801Z", "metadata": {"testkey": "test-value"}, "configuration": {"changeDestinations": [{"createdAt": "2022-02-09T16:28:38.997313Z", "updatedAt": "0001-01-01T00:00:00Z", "deletedAt": null, "id": "252e8a915a5f05effab827a887e261a2416a76f3d3aada946a70a575c0bb76a7", "xpubId": "9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36", "lockingScript": "76a9143dbdb346aaf1c3dc501a2f8c186c3d3e8a87764588ac", "type": "pubkeyhash", "chain": 1, "num": 100, "address": "16dTUJwi7qT3JqzAUMcDHaVV3sB4fH85Ep", "draftId": "fe6fe12c25b81106b7332d58fe87dab7bc6e56c8c21ca45b4de05f673f3f653c"}], "changeDestinationsStrategy": "", "changeMinimumSatoshis": 0, "changeNumberOfDestinations": 0, "changeSatoshis": 3607, "expiresIn": 0, "fee": 97, "feeUnit": {"satoshis": 1, "bytes": 2}, "fromUtxos": null, "inputs": [{"createdAt": "2022-01-28T13:45:02.352Z", "updatedAt": "2022-02-09T16:28:38.993207Z", "deletedAt": null, "id": "efe383eea1a6f7925afb2621b69ea9ba6bd0623e8d61827bad994f8be85161fc", "transactionId": "5ddce775b076535eb57eb5802bbeb997347c0e10ddbf5711e1253f5a4dbee341", "xpubId": "9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36", "outputIndex": 2, "satoshis": 4704, "scriptPubKey": "76a914c746bf0f295375cbea4a5ef25b36c84ff9801bac88ac", "type": "pubkeyhash", "draftId": "fe6fe12c25b81106b7332d58fe87dab7bc6e56c8c21ca45b4de05f673f3f653c", "reservedAt": "2022-02-09T16:28:38.993205Z", "spendingTxId": null, "destination": {"createdAt": "2022-01-28T13:45:02.324Z", "updatedAt": "0001-01-01T00:00:00Z", "metadata": {"clientId": "8", "run": 90, "runId": "3108aa426fc7102488bb0ffd", "xbench": "destination for testing"}, "deletedAt": null, "id": "b8bfa56e37c90f1b25df2e571f727cfec80dd17c5d1845c4b93e21034f7f6a0b", "xpubId": "9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36", "lockingScript": "76a914c746bf0f295375cbea4a5ef25b36c84ff9801bac88ac", "type": "pubkeyhash", "chain": 0, "num": 212, "address": "1KAgDiUasnC7roCjQZM1XLJUpq4BYHjdp6", "draftId": ""}}], "miner": "", "outputs": [{"satoshis": 1000, "scripts": [{"address": "1CfaQw9udYNPccssFJFZ94DN8MqNZm9nGt", "satoshis": 1000, "script": "76a9147ff514e6ae3deb46e6644caac5cdd0bf2388906588ac", "scriptType": "pubkeyhash"}], "to": "1CfaQw9udYNPccssFJFZ94DN8MqNZm9nGt", "opReturn": null}, {"satoshis": 3607, "scripts": [{"address": "16dTUJwi7qT3JqzAUMcDHaVV3sB4fH85Ep", "satoshis": 3607, "script": "76a9143dbdb346aaf1c3dc501a2f8c186c3d3e8a87764588ac", "scriptType": ""}], "to": "16dTUJwi7qT3JqzAUMcDHaVV3sB4fH85Ep", "opReturn": null}], "sendAllTo": "", "sync": null}, "status": "draft"}`;
const draftTxJSON2 = `{"id":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","xpubId":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","configuration":{"inputs":[{"id":"6f893de42f8642c6e5b58f427bfe7fe36498a854f4b7439b0f6399a6f34fd680","satoshis":2395,"transactionId":"57c3883b3538de4419bde571bad3aa22577b911f48be38873711a565170a2e75","outputIndex":1,"scriptPubKey":"76a9149e8bb81cc5d3aeca52f7221e2701fd3972c6245088ac","destination":{"id":"897b2f7e2c7258fc767600f61420ed30b4cad8e060e3a920e0540d71fe3fa0be","address":"1FTK9AnLoWdc9uPpg3WQqh9ApPWRe48zRp","type":"pubkeyhash","num":213,"chain":0,"lockingScript":"76a9149e8bb81cc5d3aeca52f7221e2701fd3972c6245088ac","typename":"Destination"},"typename":"TransactionInput"},{"id":"597a666b25bfb55b5b077f54ad64e8f302ce1fbeae3a97d41148f2f285811537","satoshis":3946,"transactionId":"480e10635efb96664ea90843820ef5b0db743b9a67e16857633f9be305ed3d24","outputIndex":1,"scriptPubKey":"76a9146fe3504de216287a481c10174a6f61944f16de8a88ac","destination":{"id":"c973d543bd78060ac519b757291e798cc5bceb371e16fa90b5f968d7896f5ff8","address":"1BCcKKrkhKe2JyArhJATb3Jg5cVtBE7fGi","type":"pubkeyhash","num":214,"chain":0,"lockingScript":"76a9146fe3504de216287a481c10174a6f61944f16de8a88ac","typename":"Destination"},"typename":"TransactionInput"},{"id":"51396f86afed1be9a0881da62440937697325e19ac9cccfc8d0444174a9e1ca7","satoshis":1607,"transactionId":"76bffaf1647f529431b714d8076e42e7a4b957fdb78d28812d329134e8e9d901","outputIndex":1,"scriptPubKey":"76a914b0af70b7b2ce999854f8a03b55fbe176e1476a2b88ac","destination":{"id":"0da19093bd6980cbd8262345ad68875960a132cec93e620d219d81c95de7275a","address":"1H7E6Zx7u24yMY8fKmvxrz5XBveK5D3azX","type":"pubkeyhash","num":215,"chain":0,"lockingScript":"76a914b0af70b7b2ce999854f8a03b55fbe176e1476a2b88ac","typename":"Destination"},"typename":"TransactionInput"},{"id":"0342f3901285cb4acae7f2682734e70bbccbe07f3d1de723a2e791fd25fbc868","satoshis":5278,"transactionId":"76bffaf1647f529431b714d8076e42e7a4b957fdb78d28812d329134e8e9d901","outputIndex":3,"scriptPubKey":"76a914c737741c218bea665772d784505911baf37f1da588ac","destination":{"id":"f4323a62ada45e8818cde382ca60ff411eaad89dbfb6e0ffaee34cf3e7000ab4","address":"1KAMu9yaYFmARwkmff4mehtPURJezFfciy","type":"pubkeyhash","num":216,"chain":0,"lockingScript":"76a914c737741c218bea665772d784505911baf37f1da588ac","typename":"Destination"},"typename":"TransactionInput"},{"id":"ad4e8387285861253b9090826328ceb486fc296d02446998e02c07725ed6be71","satoshis":985,"transactionId":"819a20cc0f5a0c0d0e155984bc247915b6bd5708933c5bb56613ce751531b876","outputIndex":3,"scriptPubKey":"76a91472affcedae840864b53b2f1935ffe69b564de73588ac","destination":{"id":"ed71cddcd8513d727cbe4c4f97d0bb0c3d292a068058ab63515242c772557f8a","address":"1BTQrjJh9HsvG6eEkFeW3bqqyJTEveXtqd","type":"pubkeyhash","num":90,"chain":1,"lockingScript":"76a91472affcedae840864b53b2f1935ffe69b564de73588ac","typename":"Destination"},"typename":"TransactionInput"},{"id":"c0d24c7c3779c5e605bca94629f427c217c2f87a7dbe251576751424b164874e","satoshis":4131,"transactionId":"0f43d147679bdd181e87c8701309068f7457989e8583fd2a2059134157418b14","outputIndex":2,"scriptPubKey":"76a914613234b0f125f8eab12231c484c066bcedb690c788ac","destination":{"id":"be318b2f9539290e5e546702223411d9683bcfc5bb5402635399e2158932d59c","address":"19rvgyE8iuPMqn7SYziid51ZchMCMHTQ3i","type":"pubkeyhash","num":217,"chain":0,"lockingScript":"76a914613234b0f125f8eab12231c484c066bcedb690c788ac","typename":"Destination"},"typename":"TransactionInput"},{"id":"2cc9644e19b51fd81540ac704a9264388f06fd6a82516a99b41a1192eb4bff97","satoshis":3017,"transactionId":"6aca717e106ff6ac62f69211f9fda02c183c15bc2b31f4a0e86c53a29d27b5b3","outputIndex":0,"scriptPubKey":"76a914964a1931261d04566c8c70b94f48cd176928c01788ac","destination":{"id":"cd49ffcd80de77e614f63560b732cb5186f9753914adc24864cee72e959653d9","address":"1Ehf8Dt6JNKC7KQdpVzEQhGp23JqJgvvTC","type":"pubkeyhash","num":220,"chain":0,"lockingScript":"76a914964a1931261d04566c8c70b94f48cd176928c01788ac","typename":"Destination"},"typename":"TransactionInput"},{"id":"09ed535a5ea8851e887c227782777be6db5e8f3eafe4b191b87651249d940a5d","satoshis":99881732,"transactionId":"6aca717e106ff6ac62f69211f9fda02c183c15bc2b31f4a0e86c53a29d27b5b3","outputIndex":3,"scriptPubKey":"76a914a83b90f55720e9055e0a2281b3ac0e8b312f7ea588ac","destination":{"id":"1a0ca2c18432c90d257688a16be40d4bb0195df0cad8193e155ac3e48c90102a","address":"1GLXsxqRxPpXsQsU3zeYs7UrrtcZ5QVVsX","type":"pubkeyhash","num":91,"chain":1,"lockingScript":"76a914a83b90f55720e9055e0a2281b3ac0e8b312f7ea588ac","typename":"Destination"},"typename":"TransactionInput"}],"outputs":[{"to":"1C1tuBodLqmJcy7RH5oQHeBEhGvHhoccSA","satoshis":234423,"scripts":[{"address":"1C1tuBodLqmJcy7RH5oQHeBEhGvHhoccSA","satoshis":234423,"script":"76a91478d4b515b0e9de6fa483889eea9e1285630247ae88ac","typename":"ScriptOutput"}],"paymailP4":null,"typename":"TransactionOutput"},{"to":"18C3n8CDgtxc62b56V1sNorR7wAToF9jLH","satoshis":37018825,"scripts":[{"address":"18C3n8CDgtxc62b56V1sNorR7wAToF9jLH","satoshis":37018825,"script":"76a9144edfc667fab03d524fd96c487262369b12d22a3188ac","typename":"ScriptOutput"}],"paymailP4":null,"typename":"TransactionOutput"},{"to":"18Y9SoziUyrzo2JoNnfwrQhFamvpPkNfhM","satoshis":27051980,"scripts":[{"address":"18Y9SoziUyrzo2JoNnfwrQhFamvpPkNfhM","satoshis":27051980,"script":"76a91452acd3287e875e14e4c9dba8cb0a33e7b1cb3fdd88ac","typename":"ScriptOutput"}],"paymailP4":null,"typename":"TransactionOutput"},{"to":"1K8auRR89TN7AJW1JrgcafBmXhdWXvTxpz","satoshis":35597248,"scripts":[{"address":"1K8auRR89TN7AJW1JrgcafBmXhdWXvTxpz","satoshis":35597248,"script":"76a914c6e17a315b6766b0244e9d54667202730f8dc20888ac","typename":"ScriptOutput"}],"paymailP4":null,"typename":"TransactionOutput"}],"changeDestinations":[{"address":"18C3n8CDgtxc62b56V1sNorR7wAToF9jLH","chain":1,"num":112,"lockingScript":"76a9144edfc667fab03d524fd96c487262369b12d22a3188ac","draftId":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","typename":"Destination"},{"address":"18Y9SoziUyrzo2JoNnfwrQhFamvpPkNfhM","chain":1,"num":113,"lockingScript":"76a91452acd3287e875e14e4c9dba8cb0a33e7b1cb3fdd88ac","draftId":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","typename":"Destination"},{"address":"1K8auRR89TN7AJW1JrgcafBmXhdWXvTxpz","chain":1,"num":114,"lockingScript":"76a914c6e17a315b6766b0244e9d54667202730f8dc20888ac","draftId":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","typename":"Destination"}],"changeSatoshis":99668053,"fee":615,"typename":"TransactionConfig"},"status":"draft","expiresAt":"2022-03-04T14:26:34.755995Z","hex":"0100000008752e0a1765a511378738be481f917b5722aad3ba71e5bd1944de38353b88c3570100000000ffffffff243ded05e39b3f635768e1679a3b74dbb0f50e824308a94e6696fb5e63100e480100000000ffffffff01d9e9e83491322d81288db7fd57b9a4e7426e07d814b73194527f64f1fabf760100000000ffffffff01d9e9e83491322d81288db7fd57b9a4e7426e07d814b73194527f64f1fabf760300000000ffffffff76b8311575ce1366b55b3c930857bdb6157924bc8459150e0d0c5a0fcc209a810300000000ffffffff148b4157411359202afd83859e9857748f06091370c8871e18dd9b6747d1430f0200000000ffffffffb3b5279da2536ce8a0f4312bbc153c182ca0fdf91192f662acf66f107e71ca6a0000000000ffffffffb3b5279da2536ce8a0f4312bbc153c182ca0fdf91192f662acf66f107e71ca6a0300000000ffffffff04b7930300000000001976a91478d4b515b0e9de6fa483889eea9e1285630247ae88acc9dc3402000000001976a9144edfc667fab03d524fd96c487262369b12d22a3188acccc79c01000000001976a91452acd3287e875e14e4c9dba8cb0a33e7b1cb3fdd88acc02b1f02000000001976a914c6e17a315b6766b0244e9d54667202730f8dc20888ac00000000","typename":"DraftTransaction"}`;

const accessKeyString = '7779d24ca6f8821f225042bf55e8f80aa41b08b879b72827f51e41e6523b9cd0';

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

const testClient: TestClient = httpTestClient;

beforeAll(() => {
  fetchMock.enableMocks();
});

afterAll(() => {
  fetchMock.disableMocks();
});

describe('SPVWalletUserAPI class', () => {
  test('instantiate with options', () => {
    const options: ClientOptions = {
      xPriv: xPrivString,
    };
    const userClient = new SPVWalletUserAPI('https://spv-wallet.org/api/v1', options, { level: 'error' });
    expect(userClient).toBeInstanceOf(SPVWalletUserAPI);
  });
});

describe('SPVWallet user routing', () => {
  const options: ClientOptions = {
    xPriv: testClient.xPrivString,
  };
  const userClient = new SPVWalletUserAPI(testClient.serverURL, options, { level: 'error' });

  it.each`
    spvWalletMethod                | httpMethod  | path                                       | act
    ${'getUserInfo'}               | ${'get'}    | ${'users/current'}                         | ${() => userClient.xPub()}
    ${'updateXPubMetadata'}        | ${'patch'}  | ${'users/current'}                         | ${() => userClient.updateXPubMetadata({})}
    ${'getAccessKeyById'}          | ${'get'}    | ${'users/current/keys/' + accessKeyString} | ${() => userClient.accessKey(accessKeyString)}
    ${'getAccessKeys'}             | ${'get'}    | ${'users/current/keys'}                    | ${() => userClient.accessKeys({}, {})}
    ${'createAccessKey'}           | ${'post'}   | ${'users/current/keys'}                    | ${() => userClient.generateAccessKey({})}
    ${'revokeAccessKey'}           | ${'delete'} | ${'users/current/keys/' + accessKeyString} | ${() => userClient.revokeAccessKey(accessKeyString)}
    ${'getContactByPaymail'}       | ${'get'}    | ${'contacts/test'}                         | ${() => userClient.contactWithPaymail('test')}
    ${'getContacts'}               | ${'get'}    | ${'contacts'}                              | ${() => userClient.contacts({}, {}, {})}
    ${'upsertContact'}             | ${'put'}    | ${'contacts/test'}                         | ${() => userClient.upsertContact('test', '', '', {})}
    ${'removeContact'}             | ${'delete'} | ${'contacts/test'}                         | ${() => userClient.removeContact('test')}
    ${'acceptContactInvitation'}   | ${'post'}   | ${'invitations/test/contacts'}             | ${() => userClient.acceptInvitation('test')}
    ${'rejectContactInvitation'}   | ${'delete'} | ${'invitations/test/contacts'}             | ${() => userClient.rejectInvitation('test')}
    ${'unconfirmContact'}          | ${'delete'} | ${'contacts/test/confirmation'}            | ${() => userClient.unconfirmContact('test')}
    ${'getTransactionById'}        | ${'get'}    | ${'transactions/id'}                       | ${() => userClient.transaction('id')}
    ${'getTransactions'}           | ${'get'}    | ${'transactions'}                          | ${() => userClient.transactions({}, {}, {})}
    ${'newDraftTransaction'}       | ${'post'}   | ${'transactions/drafts'}                   | ${() => userClient.draftTransaction({} as DraftTransactionConfig, {})}
    ${'recordTransaction'}         | ${'post'}   | ${'transactions'}                          | ${() => userClient.recordTransaction('', '', {})}
    ${'updateTransactionMetadata'} | ${'patch'}  | ${'transactions/id'}                       | ${() => userClient.updateTransactionMetadata('id', {})}
    ${'getUtxos'}                  | ${'get'}    | ${'utxos'}                                 | ${() => userClient.utxos({}, {}, {})}
    ${'getSharedConfig'}           | ${'get'}    | ${'configs/shared'}                        | ${() => userClient.sharedConfig()}
  `('$spvWalletMethod', async ({ path, httpMethod, act }) => {
    // given
    setupHttpMock(httpMethod, path);

    // when
    await act();

    // then
    // verify the API call was actually made
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(`${serverURL}/${path}`);

    // clean up
    fetchMock.resetMocks();
  });
});

describe('SPVWallet admin routing', () => {
  const options : AdminClientOptions = {
    adminKey: testClient.xPrivString,
  };
  const adminClient = new SPVWalletAdminAPI(testClient.serverURL, options, { level: 'error' });

  it.each`
    spvWalletMethod         | httpMethod  | path                              | act
    ${'createXPub'}         | ${'post'}   | ${'admin/users'}                  | ${() => adminClient.createXPub('', {})}
    ${'status'}             | ${'get'}    | ${'admin/status'}                 | ${() => adminClient.status()}
    ${'stats'}              | ${'get'}    | ${'admin/stats'}                  | ${() => adminClient.stats()}
    ${'accessKeys'}         | ${'get'}    | ${'admin/users/keys'}             | ${() => adminClient.accessKeys({}, {}, {})}
    ${'contacts'}           | ${'get'}    | ${'admin/contacts'}               | ${() => adminClient.contacts({}, {}, {})}
    ${'createContact'}      | ${'post'}   | ${'admin/contacts/test'}          | ${() => adminClient.createContact('test', {} as NewContact)}
    ${'contactUpdate'}      | ${'put'}    | ${'admin/contacts/1'}             | ${() => adminClient.contactUpdate('1', '', {})}
    ${'deleteContact'}      | ${'delete'} | ${'admin/contacts/1'}             | ${() => adminClient.deleteContact('1')}
    ${'acceptInvitation'}   | ${'post'}   | ${'admin/invitations/1'}          | ${() => adminClient.acceptInvitation('1')}
    ${'rejectInvitation'}   | ${'delete'} | ${'admin/invitations/1'}          | ${() => adminClient.rejectInvitation('1')}
    ${'paymail'}            | ${'get'}    | ${'admin/paymails/test'}          | ${() => adminClient.paymail('test')}
    ${'paymails'}           | ${'get'}    | ${'admin/paymails'}               | ${() => adminClient.paymails({}, {}, {})}
    ${'createPaymail'}      | ${'post'}   | ${'admin/paymails'}               | ${() => adminClient.createPaymail('', '', '', '', {})}
    ${'deletePaymail'}      | ${'delete'} | ${'admin/paymails/test'}          | ${() => adminClient.deletePaymail('test')}
    ${'transactions'}       | ${'get'}    | ${'admin/transactions'}           | ${() => adminClient.transactions({}, {}, {})}
    ${'utxos'}              | ${'get'}    | ${'admin/utxos'}                  | ${() => adminClient.utxos({}, {}, {})}
    ${'xPubs'}              | ${'get'}    | ${'admin/users'}                  | ${() => adminClient.xPubs({}, {}, {})}
    ${'subscribeWebhook'}   | ${'post'}   | ${'admin/webhooks/subscriptions'} | ${() => adminClient.subscribeWebhook('', '', '')}
    ${'unsubscribeWebhook'} | ${'delete'} | ${'admin/webhooks/subscriptions'} | ${() => adminClient.unsubscribeWebhook('')}
  `('$spvWalletMethod', async ({ path, httpMethod, act }) => {
    // given
    setupHttpMock(httpMethod, path);

    // when
    await act();

    // then
    // verify the API call was actually made
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(`${serverURL}/${path}`);

    // clean up
    fetchMock.resetMocks();
  });
});

describe('Finalize transaction', () => {
  test('draftTxJSON', async () => {
    const userClient = new SPVWalletUserAPI(
      serverURL,
      {
        xPriv: xPrivString,
      },
      { level: 'error' },
    );

    const draftTransaction: DraftTx = JSON.parse(draftTxJSON);
    const transaction = await userClient.finalizeTransaction(draftTransaction);
    expect(typeof transaction).toBe('string');
  });

  test('draftTxJSON2', async () => {
    const userClient = new SPVWalletUserAPI(
      serverURL,
      {
        xPriv: xPrivString,
      },
      { level: 'error' },
    );

    const draftTransaction: DraftTx = JSON.parse(draftTxJSON2);
    const transaction = await userClient.finalizeTransaction(draftTransaction);
    expect(typeof transaction).toBe('string');
  });
});

function setupHttpMock(httpVerb: string, routing: string) {
  routing = serverURL + '/' + routing;
  fetchMock.doMockIf(routing, () => new Promise((r) => r('{}')));
}

import {describe, expect, test} from '@jest/globals'
import fetchMock from "jest-fetch-mock"

import { BuxClient } from "./index";
import {
  Client,
  ClientOptions,
  Conditions,
  DraftTransaction,
  Metadata,
  TransportService,
  TransportType
} from "./interface";

const adminKeyXpub = "xprv9s21ZrQH143K4Z8JnrQ7XsYxzKbFNsAEPyHMaMU2fbMtoY1YmsJLFo3XBkg2m7e9UJLS6xvd2HjZ5WN9fQbMSGU7uXEE2pksvbQYCXswLB5"
const xPubID = "9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36"
const xPrivString = "xprv9s21ZrQH143K49XnCBsjkh7Lqt2Je9iCXBqCUp6xUvb2jCGyeShuqMLiG5Ro6JggbKaud4sg1PmgYGptKTc2FhA3SEGCcaeiTESNDp1Vj2A"
const xPubString = "xpub661MyMwAqRbcGdcFJDQk7q45Puro3cS3tQkoHCWa3G81bzc8Bz2AP9fC7MT4SfsbPfCie1fR1o8VPf735w3ZeEmvDF6AMQifS3FfeUfrDS7"
const serverURL = "https://bux.org/v1"
const xpubJSON = `{"id": "9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","current_balance": 100006767,"next_internal_num": 0,"next_external_num": 0,"metadata": null,"created_at": "2022-01-28T13:44:58.874Z","updated_at": null,"deleted_at": null}`;
const draftTxJSON = `{"created_at":"2022-02-09T16:28:39.000639Z","updated_at":"0001-01-01T00:00:00Z","deleted_at":null,"id":"fe6fe12c25b81106b7332d58fe87dab7bc6e56c8c21ca45b4de05f673f3f653c","hex":"010000000141e3be4d5a3f25e11157bfdd100e7c3497b9be2b80b57eb55e5376b075e7dc5d0200000000ffffffff02e8030000000000001976a9147ff514e6ae3deb46e6644caac5cdd0bf2388906588ac170e0000000000001976a9143dbdb346aaf1c3dc501a2f8c186c3d3e8a87764588ac00000000","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","expires_at":"2022-02-09T16:29:08.991801Z","metadata":{"testkey":"test-value"},"configuration":{"change_destinations":[{"created_at":"2022-02-09T16:28:38.997313Z","updated_at":"0001-01-01T00:00:00Z","deleted_at":null,"id":"252e8a915a5f05effab827a887e261a2416a76f3d3aada946a70a575c0bb76a7","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","locking_script":"76a9143dbdb346aaf1c3dc501a2f8c186c3d3e8a87764588ac","type":"pubkeyhash","chain":1,"num":100,"address":"16dTUJwi7qT3JqzAUMcDHaVV3sB4fH85Ep","draft_id":"fe6fe12c25b81106b7332d58fe87dab7bc6e56c8c21ca45b4de05f673f3f653c"}],"change_destinations_strategy":"","change_minimum_satoshis":0,"change_number_of_destinations":0,"change_satoshis":3607,"expires_in":0,"fee":97,"fee_unit":{"satoshis":1,"bytes":2},"from_utxos":null,"inputs":[{"created_at":"2022-01-28T13:45:02.352Z","updated_at":"2022-02-09T16:28:38.993207Z","deleted_at":null,"id":"efe383eea1a6f7925afb2621b69ea9ba6bd0623e8d61827bad994f8be85161fc","transaction_id":"5ddce775b076535eb57eb5802bbeb997347c0e10ddbf5711e1253f5a4dbee341","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","output_index":2,"satoshis":4704,"script_pub_key":"76a914c746bf0f295375cbea4a5ef25b36c84ff9801bac88ac","type":"pubkeyhash","draft_id":"fe6fe12c25b81106b7332d58fe87dab7bc6e56c8c21ca45b4de05f673f3f653c","reserved_at":"2022-02-09T16:28:38.993205Z","spending_tx_id":null,"destination":{"created_at":"2022-01-28T13:45:02.324Z","updated_at":"0001-01-01T00:00:00Z","metadata":{"client_id":"8","run":90,"run_id":"3108aa426fc7102488bb0ffd","xbench":"destination for testing"},"deleted_at":null,"id":"b8bfa56e37c90f1b25df2e571f727cfec80dd17c5d1845c4b93e21034f7f6a0b","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","locking_script":"76a914c746bf0f295375cbea4a5ef25b36c84ff9801bac88ac","type":"pubkeyhash","chain":0,"num":212,"address":"1KAgDiUasnC7roCjQZM1XLJUpq4BYHjdp6","draft_id":""}}],"miner":"","outputs":[{"satoshis":1000,"scripts":[{"address":"1CfaQw9udYNPccssFJFZ94DN8MqNZm9nGt","satoshis":1000,"script":"76a9147ff514e6ae3deb46e6644caac5cdd0bf2388906588ac","script_type":"pubkeyhash"}],"to":"1CfaQw9udYNPccssFJFZ94DN8MqNZm9nGt","op_return":null},{"satoshis":3607,"scripts":[{"address":"16dTUJwi7qT3JqzAUMcDHaVV3sB4fH85Ep","satoshis":3607,"script":"76a9143dbdb346aaf1c3dc501a2f8c186c3d3e8a87764588ac","script_type":""}],"to":"16dTUJwi7qT3JqzAUMcDHaVV3sB4fH85Ep","op_return":null}],"send_all_to":"","sync":null},"status":"draft"}`
const draftTxJSON2 = `{"id":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","configuration":{"inputs":[{"id":"6f893de42f8642c6e5b58f427bfe7fe36498a854f4b7439b0f6399a6f34fd680","satoshis":2395,"transaction_id":"57c3883b3538de4419bde571bad3aa22577b911f48be38873711a565170a2e75","output_index":1,"script_pub_key":"76a9149e8bb81cc5d3aeca52f7221e2701fd3972c6245088ac","destination":{"id":"897b2f7e2c7258fc767600f61420ed30b4cad8e060e3a920e0540d71fe3fa0be","address":"1FTK9AnLoWdc9uPpg3WQqh9ApPWRe48zRp","type":"pubkeyhash","num":213,"chain":0,"locking_script":"76a9149e8bb81cc5d3aeca52f7221e2701fd3972c6245088ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"597a666b25bfb55b5b077f54ad64e8f302ce1fbeae3a97d41148f2f285811537","satoshis":3946,"transaction_id":"480e10635efb96664ea90843820ef5b0db743b9a67e16857633f9be305ed3d24","output_index":1,"script_pub_key":"76a9146fe3504de216287a481c10174a6f61944f16de8a88ac","destination":{"id":"c973d543bd78060ac519b757291e798cc5bceb371e16fa90b5f968d7896f5ff8","address":"1BCcKKrkhKe2JyArhJATb3Jg5cVtBE7fGi","type":"pubkeyhash","num":214,"chain":0,"locking_script":"76a9146fe3504de216287a481c10174a6f61944f16de8a88ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"51396f86afed1be9a0881da62440937697325e19ac9cccfc8d0444174a9e1ca7","satoshis":1607,"transaction_id":"76bffaf1647f529431b714d8076e42e7a4b957fdb78d28812d329134e8e9d901","output_index":1,"script_pub_key":"76a914b0af70b7b2ce999854f8a03b55fbe176e1476a2b88ac","destination":{"id":"0da19093bd6980cbd8262345ad68875960a132cec93e620d219d81c95de7275a","address":"1H7E6Zx7u24yMY8fKmvxrz5XBveK5D3azX","type":"pubkeyhash","num":215,"chain":0,"locking_script":"76a914b0af70b7b2ce999854f8a03b55fbe176e1476a2b88ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"0342f3901285cb4acae7f2682734e70bbccbe07f3d1de723a2e791fd25fbc868","satoshis":5278,"transaction_id":"76bffaf1647f529431b714d8076e42e7a4b957fdb78d28812d329134e8e9d901","output_index":3,"script_pub_key":"76a914c737741c218bea665772d784505911baf37f1da588ac","destination":{"id":"f4323a62ada45e8818cde382ca60ff411eaad89dbfb6e0ffaee34cf3e7000ab4","address":"1KAMu9yaYFmARwkmff4mehtPURJezFfciy","type":"pubkeyhash","num":216,"chain":0,"locking_script":"76a914c737741c218bea665772d784505911baf37f1da588ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"ad4e8387285861253b9090826328ceb486fc296d02446998e02c07725ed6be71","satoshis":985,"transaction_id":"819a20cc0f5a0c0d0e155984bc247915b6bd5708933c5bb56613ce751531b876","output_index":3,"script_pub_key":"76a91472affcedae840864b53b2f1935ffe69b564de73588ac","destination":{"id":"ed71cddcd8513d727cbe4c4f97d0bb0c3d292a068058ab63515242c772557f8a","address":"1BTQrjJh9HsvG6eEkFeW3bqqyJTEveXtqd","type":"pubkeyhash","num":90,"chain":1,"locking_script":"76a91472affcedae840864b53b2f1935ffe69b564de73588ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"c0d24c7c3779c5e605bca94629f427c217c2f87a7dbe251576751424b164874e","satoshis":4131,"transaction_id":"0f43d147679bdd181e87c8701309068f7457989e8583fd2a2059134157418b14","output_index":2,"script_pub_key":"76a914613234b0f125f8eab12231c484c066bcedb690c788ac","destination":{"id":"be318b2f9539290e5e546702223411d9683bcfc5bb5402635399e2158932d59c","address":"19rvgyE8iuPMqn7SYziid51ZchMCMHTQ3i","type":"pubkeyhash","num":217,"chain":0,"locking_script":"76a914613234b0f125f8eab12231c484c066bcedb690c788ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"2cc9644e19b51fd81540ac704a9264388f06fd6a82516a99b41a1192eb4bff97","satoshis":3017,"transaction_id":"6aca717e106ff6ac62f69211f9fda02c183c15bc2b31f4a0e86c53a29d27b5b3","output_index":0,"script_pub_key":"76a914964a1931261d04566c8c70b94f48cd176928c01788ac","destination":{"id":"cd49ffcd80de77e614f63560b732cb5186f9753914adc24864cee72e959653d9","address":"1Ehf8Dt6JNKC7KQdpVzEQhGp23JqJgvvTC","type":"pubkeyhash","num":220,"chain":0,"locking_script":"76a914964a1931261d04566c8c70b94f48cd176928c01788ac","__typename":"Destination"},"__typename":"TransactionInput"},{"id":"09ed535a5ea8851e887c227782777be6db5e8f3eafe4b191b87651249d940a5d","satoshis":99881732,"transaction_id":"6aca717e106ff6ac62f69211f9fda02c183c15bc2b31f4a0e86c53a29d27b5b3","output_index":3,"script_pub_key":"76a914a83b90f55720e9055e0a2281b3ac0e8b312f7ea588ac","destination":{"id":"1a0ca2c18432c90d257688a16be40d4bb0195df0cad8193e155ac3e48c90102a","address":"1GLXsxqRxPpXsQsU3zeYs7UrrtcZ5QVVsX","type":"pubkeyhash","num":91,"chain":1,"locking_script":"76a914a83b90f55720e9055e0a2281b3ac0e8b312f7ea588ac","__typename":"Destination"},"__typename":"TransactionInput"}],"outputs":[{"to":"1C1tuBodLqmJcy7RH5oQHeBEhGvHhoccSA","satoshis":234423,"scripts":[{"address":"1C1tuBodLqmJcy7RH5oQHeBEhGvHhoccSA","satoshis":234423,"script":"76a91478d4b515b0e9de6fa483889eea9e1285630247ae88ac","__typename":"ScriptOutput"}],"paymail_p4":null,"__typename":"TransactionOutput"},{"to":"18C3n8CDgtxc62b56V1sNorR7wAToF9jLH","satoshis":37018825,"scripts":[{"address":"18C3n8CDgtxc62b56V1sNorR7wAToF9jLH","satoshis":37018825,"script":"76a9144edfc667fab03d524fd96c487262369b12d22a3188ac","__typename":"ScriptOutput"}],"paymail_p4":null,"__typename":"TransactionOutput"},{"to":"18Y9SoziUyrzo2JoNnfwrQhFamvpPkNfhM","satoshis":27051980,"scripts":[{"address":"18Y9SoziUyrzo2JoNnfwrQhFamvpPkNfhM","satoshis":27051980,"script":"76a91452acd3287e875e14e4c9dba8cb0a33e7b1cb3fdd88ac","__typename":"ScriptOutput"}],"paymail_p4":null,"__typename":"TransactionOutput"},{"to":"1K8auRR89TN7AJW1JrgcafBmXhdWXvTxpz","satoshis":35597248,"scripts":[{"address":"1K8auRR89TN7AJW1JrgcafBmXhdWXvTxpz","satoshis":35597248,"script":"76a914c6e17a315b6766b0244e9d54667202730f8dc20888ac","__typename":"ScriptOutput"}],"paymail_p4":null,"__typename":"TransactionOutput"}],"change_destinations":[{"address":"18C3n8CDgtxc62b56V1sNorR7wAToF9jLH","chain":1,"num":112,"locking_script":"76a9144edfc667fab03d524fd96c487262369b12d22a3188ac","draft_id":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","__typename":"Destination"},{"address":"18Y9SoziUyrzo2JoNnfwrQhFamvpPkNfhM","chain":1,"num":113,"locking_script":"76a91452acd3287e875e14e4c9dba8cb0a33e7b1cb3fdd88ac","draft_id":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","__typename":"Destination"},{"address":"1K8auRR89TN7AJW1JrgcafBmXhdWXvTxpz","chain":1,"num":114,"locking_script":"76a914c6e17a315b6766b0244e9d54667202730f8dc20888ac","draft_id":"8059aece83eb455c92965c331f406fa636e75985455c446402e15566cecaba44","__typename":"Destination"}],"change_satoshis":99668053,"fee":615,"__typename":"TransactionConfig"},"status":"draft","expires_at":"2022-03-04T14:26:34.755995Z","hex":"0100000008752e0a1765a511378738be481f917b5722aad3ba71e5bd1944de38353b88c3570100000000ffffffff243ded05e39b3f635768e1679a3b74dbb0f50e824308a94e6696fb5e63100e480100000000ffffffff01d9e9e83491322d81288db7fd57b9a4e7426e07d814b73194527f64f1fabf760100000000ffffffff01d9e9e83491322d81288db7fd57b9a4e7426e07d814b73194527f64f1fabf760300000000ffffffff76b8311575ce1366b55b3c930857bdb6157924bc8459150e0d0c5a0fcc209a810300000000ffffffff148b4157411359202afd83859e9857748f06091370c8871e18dd9b6747d1430f0200000000ffffffffb3b5279da2536ce8a0f4312bbc153c182ca0fdf91192f662acf66f107e71ca6a0000000000ffffffffb3b5279da2536ce8a0f4312bbc153c182ca0fdf91192f662acf66f107e71ca6a0300000000ffffffff04b7930300000000001976a91478d4b515b0e9de6fa483889eea9e1285630247ae88acc9dc3402000000001976a9144edfc667fab03d524fd96c487262369b12d22a3188acccc79c01000000001976a91452acd3287e875e14e4c9dba8cb0a33e7b1cb3fdd88acc02b1f02000000001976a914c6e17a315b6766b0244e9d54667202730f8dc20888ac00000000","__typename":"DraftTransaction"}`
const destinationID = "90d10acb85f37dd009238fe7ec61a1411725825c82099bd8432fcb47ad8326ce";
const destinationAddress = "12HL5RyEy3Rt6SCwxgpiFSTigem1Pzbq22";
const destinationLockingScript = "76a9140e0eb4911d79e9b7683f268964f595b66fa3604588ac";
const destinationJSON = `{"id":"90d10acb85f37dd009238fe7ec61a1411725825c82099bd8432fcb47ad8326ce","xpub_id":"9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","locking_script":"76a9140e0eb4911d79e9b7683f268964f595b66fa3604588ac","type":"pubkeyhash","chain":0,"num":245,"address":"12HL5RyEy3Rt6SCwxgpiFSTigem1Pzbq22","metadata":{"test":"test value"},"created_at":"2022-01-28T13:45:01.711Z","updated_at":null,"deleted_at":null}`
const transactionID = "041479f86c475603fd510431cf702bc8c9849a9c350390eb86b467d82a13cc24";
const transactionJSON = `{"id":"041479f86c475603fd510431cf702bc8c9849a9c350390eb86b467d82a13cc24","created_at":"2022-01-28T13:45:01.711Z","updated_at":null,"deleted_at":null,"hex":"0100000004afcafa163824904aa3bbc403b30db56a08f29ffa53b16b1b4b4914b9bd7d7610010000006a4730440220710c2b2fe5a0ece2cbc962635d0fb6dabf95c94db0b125c3e2613cede9738666022067e9cc0f4f706c3a2781990981a50313fb0aad18c1e19a757125eec2408ecadb412103dcd8d28545c9f80af54648fcca87972d89e3e7ed7b482465dd78b62c784ad533ffffffff783452c4038c46a4d68145d829f09c70755edd8d4b3512d7d6a27db08a92a76b000000006b483045022100ee7e24859274013e748090a022bf51200ab216771b5d0d57c0d074843dfa62bd02203933c2bd2880c2f8257befff44dc19cb1f3760c6eea44fc0f8094ff94bce652a41210375680e36c45658bd9b0694a48f5756298cf95b77f50bada14ef1cba6d7ea1d3affffffff25e893beb8240ede7661c02cb959799d364711ba638eccdf12e3ce60faa2fd0f010000006b483045022100fc380099ac7f41329aaeed364b95baa390be616243b80a8ef444ae0ddc76fa3a0220644a9677d40281827fa4602269720a5a453fbe77409be40293c3f8248534e5f8412102398146eff37de36ed608b2ee917a3d4b4a424722f9a00f1b48c183322a8ef2a1ffffffff00e6f915a5a3678f01229e5c320c64755f242be6cebfac54e2f77ec5e0eec581000000006b483045022100951511f81291ac234926c866f777fe8e77bc00661031675978ddecf159cc265902207a5957dac7c89493e2b7df28741ce3291e19dc8bba4b13082c69d0f2b79c70ab4121031d674b3ad42b28f3a445e9970bd9ae8fe5d3fb89ee32452d9f6dc7916ea184bfffffffff04c7110000000000001976a91483615db3fb9b9cbbf4cd407100833511a1cb278588ac30060000000000001976a914296a5295e70697e844fb4c2113b41a501d41452e88ac96040000000000001976a914e73e21935fc48df0d1cf8b73f2e8bbd23b78244a88ac27020000000000001976a9140b2b03751813e3467a28ce916cbb102d84c6eec588ac00000000","block_hash":"","block_height":0,"fee":354,"number_of_inputs":4,"number_of_outputs":4,"total_value":6955,"metadata":{"client_id":"8","run":76,"run_id":"3108aa426fc7102488bb0ffd","xbench":"is awesome"},"output_value":1725,"direction":"incoming"}`
const transactionsJSON = `[{"id":"caae6e799210dfea7591e3d55455437eb7e1091bb01463ae1e7ddf9e29c75eda","created_at":"2022-01-28T13:44:59.376Z","updated_at":null,"deleted_at":null,"hex":"0100000001cf4faa628ce1abdd2cfc641c948898bb7a3dbe043999236c3ea4436a0c79f5dc000000006a47304402206aeca14175e4477031970c1cda0af4d9d1206289212019b54f8e1c9272b5bac2022067c4d32086146ca77640f02a989f51b3c6738ebfa24683c4a923f647cf7f1c624121036295a81525ba33e22c6497c0b758e6a84b60d97c2d8905aa603dd364915c3a0effffffff023e030000000000001976a914f7fc6e0b05e91c3610efd0ce3f04f6502e2ed93d88ac99030000000000001976a914550e06a3aa71ba7414b53922c13f96a882bf027988ac00000000","block_hash":"","block_height":0,"fee":97,"number_of_inputs":1,"number_of_outputs":2,"total_value":733,"metadata":{"client_id":"8","run":14,"run_id":"3108aa426fc7102488bb0ffd","xbench":"is awesome"},"output_value":921,"direction":"incoming"},{"id":"5f4fd2be162769852e8bd1362bb8d815a89e137707b4985249876a7f0ebbb071","created_at":"2022-01-28T13:44:59.996Z","updated_at":null,"deleted_at":null,"hex":"01000000016c0c005d516ccd1f1029fa5b61be51a0feaee6e2b07804ceba71047e06edb2df000000006b483045022100ab020464941452dff13bf4ff40a6218825b8dc3502d7860857ee0dd9407e490402206325d24bd46c09b246ebe8493257f2b91d4157de58adfdedf42ba72d6de9aaf5412103a06808b0c597ee6c572baf4f167166e9fed4b8ca66d651d2345b12e0ae5344b3ffffffff0208020000000000001976a914c3367acfc659588393c68dae3eb435c5d0a088b988ac46120000000000001976a91492fc673e0630962068c8b7d909fbfeeb77e3ea3288ac00000000","block_hash":"","block_height":0,"fee":97,"number_of_inputs":1,"number_of_outputs":2,"total_value":423,"metadata":{"client_id":"8","run":32,"run_id":"3108aa426fc7102488bb0ffd","xbench":"is awesome"},"output_value":4678,"direction":"incoming"}]`
const accessKeyID = "39ecce5cb22e2abfacc89fbe2644b0db67934c788ce0312efede459f0797037d";
const accessKeyJSON = `{"id": "39ecce5cb22e2abfacc89fbe2644b0db67934c788ce0312efede459f0797037d","xpub_id": "9fe44728bf16a2dde3748f72cc65ea661f3bf18653b320d31eafcab37cf7fb36","key": "","metadata": {"test": "test value"},"created_at": "2022-02-17T18:57:55.218Z","updated_at": null,"deleted_at": null,"revoked_at": null}`;

interface TestClient {
  type: TransportType;
  xPrivString: string;
  xPubString: string;
  serverURL: string;
}
interface TestClients extends Array<TestClient>{}

const testClients: TestClients = [
  {
    type: "http",
    xPrivString,
    xPubString,
    serverURL,
  },
  {
    type: "graphql",
    xPrivString,
    xPubString,
    serverURL: serverURL + '/graphql',
  }
];

describe('BuxClient class', () => {
  test('instantiate', () => {
    const options: ClientOptions = {}
    const buxClient = new BuxClient("https://bux.org/v1", options);
    expect(buxClient).toBeInstanceOf(BuxClient);
  });

  test('instantiate with options', () => {
    const options: ClientOptions = {
      adminKey: "test-admin-key",
      debug: true,
      transportType: "graphql",
      xPrivString,
      xPubString,
    }
    const buxClient = new BuxClient("https://bux.org/v1", options);
    expect(buxClient).toBeInstanceOf(BuxClient);
  });

  test('instantiate with options', () => {
    const options: ClientOptions = {
      adminKey: "test-admin-key",
      debug: true,
      transportType: "graphql",
      xPrivString,
      xPubString,
    }
    const buxClient = new BuxClient("https://bux.org/v1", options);
    expect(buxClient).toBeInstanceOf(BuxClient);
  });
});

describe('GetXpub', () => {
  const HttpUrl = `/xpub`;
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(xpubJSON, HttpUrl, "xpub"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const xPub = await buxClient.GetXPub();
      expect(typeof xPub).toBe('object');
      expect(xPub).toStrictEqual(JSON.parse(xpubJSON));
    });
  });
});

describe('UpdateXPubMetadata', () => {
  const HttpUrl = `/xpub`;
  const metadata: Metadata = {
    "test-key": "test-value",
  };
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(xpubJSON, HttpUrl, "xpub_metadata"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const xPub = await buxClient.UpdateXPubMetadata(metadata);
      expect(typeof xPub).toBe('object');
      expect(xPub).toStrictEqual(JSON.parse(xpubJSON));
    });
  });
});

describe('GetAccessKey', () => {
  const HttpUrl = `/access-key?id=${accessKeyID}`;
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(accessKeyJSON, HttpUrl, "access_key"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const accessKey = await buxClient.GetAccessKey(accessKeyID);
      expect(typeof accessKey).toBe('object');
      expect(accessKey).toStrictEqual(JSON.parse(accessKeyJSON));
    });
  });
});

describe('GetAccessKeys', () => {
  const HttpUrl = `/access-key/search`;
  test('result', async () => {
    const accessKeysJSON = JSON.stringify([ JSON.parse(accessKeyJSON) ]);
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(accessKeysJSON, HttpUrl, "access_keys"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const accessKeys = await buxClient.GetAccessKeys({}, {}, {});
      expect(typeof accessKeys).toBe('object');
      expect(accessKeys).toStrictEqual([JSON.parse(accessKeyJSON)]);
    });
  });
});

describe('CreateAccessKey', () => {
  const HttpUrl = `/access-key`;
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(accessKeyJSON, HttpUrl, "access_key"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const accessKey = await buxClient.CreateAccessKey({});
      expect(typeof accessKey).toBe('object');
      expect(accessKey).toStrictEqual(JSON.parse(accessKeyJSON));
    });
  });
});

describe('RevokeAccessKey', () => {
  const HttpUrl = `/access-key?id=${accessKeyID}`;
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(accessKeyJSON, HttpUrl, "access_key_revoke"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const accessKey = await buxClient.RevokeAccessKey(accessKeyID);
      expect(typeof accessKey).toBe('object');
      expect(accessKey).toStrictEqual(JSON.parse(accessKeyJSON));
    });
  });
});

describe('GetDestinationByID', () => {
  const HttpUrl = `/destination?id=${destinationID}`;
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(destinationJSON, HttpUrl, "destination"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const destination = await buxClient.GetDestinationByID(destinationID);
      expect(typeof destination).toBe('object');
      expect(destination).toStrictEqual(JSON.parse(destinationJSON));
    });
  });
});

describe('GetDestinationByLockingScript', () => {
  const HttpUrl = `/destination?locking_script=${destinationLockingScript}`;
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(destinationJSON, HttpUrl, "destination"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const destination = await buxClient.GetDestinationByLockingScript(destinationLockingScript);
      expect(typeof destination).toBe('object');
      expect(destination).toStrictEqual(JSON.parse(destinationJSON));
    });
  });
});

describe('GetDestinationByAddress', () => {
  const HttpUrl = `/destination?address=${destinationAddress}`;
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(destinationJSON, HttpUrl, "destination"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const destination = await buxClient.GetDestinationByAddress(destinationAddress);
      expect(typeof destination).toBe('object');
      expect(destination).toStrictEqual(JSON.parse(destinationJSON));
    });
  });
});

describe('GetDestinations', () => {
  const HttpUrl = `/destination/search`;
  test('result', async () => {
    const destinationsJSON = JSON.stringify([ JSON.parse(destinationJSON) ]);
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(destinationsJSON, HttpUrl, "destinations"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const destinations = await buxClient.GetDestinations({}, {}, {});
      expect(typeof destinations).toBe('object');
      expect(destinations).toStrictEqual(JSON.parse(destinationsJSON));
    });
  });
});

describe('NewDestination', () => {
  const HttpUrl = `/destination`;
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(destinationJSON, HttpUrl, "destination"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const destination = await buxClient.NewDestination({});
      expect(typeof destination).toBe('object');
      expect(destination).toStrictEqual(JSON.parse(destinationJSON));
    });
  });
});

describe('UpdateDestinationMetadataByID', () => {
  const HttpUrl = `/destination`;
  const metadata: Metadata = {
    "test-key": "test-value",
  };
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(destinationJSON, HttpUrl, "destination_metadata"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const destination = await buxClient.UpdateDestinationMetadataByID(destinationID, metadata);
      expect(typeof destination).toBe('object');
      expect(destination).toStrictEqual(JSON.parse(destinationJSON));
    });
  });
});

describe('UpdateDestinationMetadataByLockingScript', () => {
  const HttpUrl = `/destination`;
  const metadata: Metadata = {
    "test-key": "test-value",
  };
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(destinationJSON, HttpUrl, "destination_metadata"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const destination = await buxClient.UpdateDestinationMetadataByLockingScript(destinationLockingScript, metadata);
      expect(typeof destination).toBe('object');
      expect(destination).toStrictEqual(JSON.parse(destinationJSON));
    });
  });
});

describe('UpdateDestinationMetadataByAddress', () => {
  const HttpUrl = `/destination`;
  const metadata: Metadata = {
    "test-key": "test-value",
  };
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(destinationJSON, HttpUrl, "destination_metadata"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const destination = await buxClient.UpdateDestinationMetadataByAddress(destinationAddress, metadata);
      expect(typeof destination).toBe('object');
      expect(destination).toStrictEqual(JSON.parse(destinationJSON));
    });
  });
});

describe('GetTransaction', () => {
  const HttpUrl = `/transaction?id=${transactionID}`;
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(transactionJSON, HttpUrl, "transaction"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const transaction = await buxClient.GetTransaction(transactionID);
      expect(typeof transaction).toBe('object');
      expect(transaction).toStrictEqual(JSON.parse(transactionJSON));
    });
  });
});

describe('GetTransactions', () => {
  const HttpUrl = "/transaction/search";
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(transactionsJSON, HttpUrl, "transactions"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const conditions: Conditions = {
        fee: {
          $lt: 100,
        },
        total_value: {
          $lt: 740,
        },
      }
      const metadata: Metadata = {
        run_id: "3108aa426fc7102488bb0ffd",
      }
      const transactions = await buxClient.GetTransactions(conditions, metadata, {});
      expect(typeof transactions).toBe('object');
      expect(transactions).toStrictEqual(JSON.parse(transactionsJSON));
    });
  });
});

describe('Finalize transaction', () => {
  test('draftTxJSON', async () => {
    const buxClient = new BuxClient(serverURL, {
      xPrivString,
      signRequest: true,
    });

    const draftTransaction: DraftTransaction = JSON.parse(draftTxJSON);
    const transaction = await buxClient.FinalizeTransaction(draftTransaction);
    expect(typeof transaction).toBe('string');
  });

  test('draftTxJSON2', async () => {
    const buxClient = new BuxClient(serverURL, {
      xPrivString,
      signRequest: true,
    });

    const draftTransaction: DraftTransaction = JSON.parse(draftTxJSON2);
    const transaction = await buxClient.FinalizeTransaction(draftTransaction);
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

describe('UpdateTransactionMetadata', () => {
  const HttpUrl = `/transaction`;
  const metadata: Metadata = {
    "test-key": "test-value",
  };
  test('result', async () => {
    // @ts-ignore
    fetchMock.mockIf(/^.*$/, mockResponse(transactionJSON, HttpUrl, "transaction_metadata"));

    await runTests(testClients, async (buxClient: TransportService) => {
      const transaction = await buxClient.UpdateTransactionMetadata(transactionID, metadata);
      expect(typeof transaction).toBe('object');
      expect(transaction).toStrictEqual(JSON.parse(transactionJSON));
    });
  });
});


const runTests = async function(testClients: TestClients, test: Function) {
  for (let i = 0; i < testClients.length; i++) {
    const testClient = testClients[i];
    const options: ClientOptions = {
      transportType: testClient.type,
      xPrivString: testClient.xPrivString,
      signRequest: true,
    };
    const buxClient = new BuxClient(testClient.serverURL, options);

    await test(buxClient);
  }
};

const mockResponse = function(response: string, expectedHttpUrl: string, expectedGraphQLMethodName: string) {
  return (req: any) => {
    const url = req.url.valueOf();
    if (req.url.endsWith('/graphql')) {
      return new Promise(r => r(`{"data":{"${expectedGraphQLMethodName}":${response},"loading":false,"networkStatus":7}}`));
    } else if (url === `${serverURL}${expectedHttpUrl}`) {
      return new Promise(r => r(response));
    } else {
      return {
        status: 500,
      };
    }
  };
}

const mockResponseError = function(expectedHttpUrl: string) {
  return (req: any) => {
    if (req.url.endsWith('/graphql')) {
      return new Promise((r, rj) => rj('http error'));
    } else if (req.url.valueOf() === `${serverURL}${expectedHttpUrl}`) {
      return new Promise((r, rj) => rj('http error'));
    } else {
      return {
        status: 500,
      };
    }
  };
};

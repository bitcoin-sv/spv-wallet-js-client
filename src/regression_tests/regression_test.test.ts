import fetchMock from 'jest-fetch-mock';
import { SPVWalletUserAPI } from '../user-api';
import { SPVWalletAdminAPI } from '../admin-api';
import {
  createUserClient,
  createAdminClient,
  sendAndVerifyFunds,
  createUser,
  getBalance,
  getEnvVariables,
  getPaymailDomain,
  getTransactions,
  RegressionTestConfig,
  RegressionTestUser,
  removeRegisteredPaymail,
  sendFunds,
} from './utils';
import {
  addContact,
  getContact,
  confirmContact,
  removeContact,
  unconfirmContact,
  getContacts,
  generateTotp as generateTotpForContact,
} from './user_api_contacts';
import {
  getContacts as getContactsAdmin,
  createContact as createContactAdmin,
  updateContact as updateContactAdmin,
  deleteContact as deleteContactAdmin,
  confirmContacts,
} from './admin_api_contacts';
import {
  getAccessKeysAdmin,
  getAccessKeys,
  generateAccessKey,
  getAccessKeyById,
  revokeAccessKey,
} from './access_key';

const MINIMAL_FUNDS_PER_TRANSACTION = 2;
const TEST_TIMEOUT_MS = 2 * 60 * 1000;
const ADMIN_XPRIV =
  'xprv9s21ZrQH143K3CbJXirfrtpLvhT3Vgusdo8coBritQ3rcS7Jy7sxWhatuxG5h2y1Cqj8FKmPp69536gmjYRpfga2MJdsGyBsnB12E19CESK';
const ADMIN_XPUB =
  'xpub661MyMwAqRbcFgfmdkPgE2m5UjHXu9dj124DbaGLSjaqVESTWfCD4VuNmEbVPkbYLCkykwVZvmA8Pbf8884TQr1FgdG2nPoHR8aB36YdDQh';

// SL = SQLite
let slPaymailDomainInstance = '';
// PG = PostgreSQL
let pgPaymailDomainInstance = '';

// Alice & Bob are users for SQLite instance
let Bob: RegressionTestUser;
let Alice: RegressionTestUser;
let bobClient: SPVWalletUserAPI;
let aliceClient: SPVWalletUserAPI;
let slLeaderClient: SPVWalletUserAPI;
let adminSLClient: SPVWalletAdminAPI;

// Tom & Jerry are users for PostgreSQL instance
let Tom: RegressionTestUser;
let Jerry: RegressionTestUser;
let tomClient: SPVWalletUserAPI;
let jerryClient: SPVWalletUserAPI;
let pgLeaderClient: SPVWalletUserAPI;
let adminPGClient: SPVWalletAdminAPI;

let rtConfig: RegressionTestConfig;

beforeAll(async () => {
  fetchMock.disableMocks();
  rtConfig = getEnvVariables();
  expect(rtConfig).toBeDefined();

  [slLeaderClient, pgLeaderClient] = await Promise.all([
    createUserClient(rtConfig.slClientURL, rtConfig.slClientLeaderXPriv),
    createUserClient(rtConfig.pgClientURL, rtConfig.pgClientLeaderXPriv),
  ]);

  let slDomainInstClient: SPVWalletUserAPI;
  let pgDomainInstClient: SPVWalletUserAPI;
  [slDomainInstClient, pgDomainInstClient] = await Promise.all([
    createUserClient(rtConfig.slClientURL, ADMIN_XPRIV),
    createUserClient(rtConfig.pgClientURL, ADMIN_XPRIV),
  ]);

  [slPaymailDomainInstance, pgPaymailDomainInstance] = await Promise.all([
    getPaymailDomain(slDomainInstClient),
    getPaymailDomain(pgDomainInstClient),
  ]);

  [adminSLClient, adminPGClient] = await Promise.all([
    createAdminClient(rtConfig.slClientURL, ADMIN_XPRIV),
    createAdminClient(rtConfig.pgClientURL, ADMIN_XPRIV),
  ]);

  [Bob, Alice, Tom, Jerry] = await Promise.all([
    createUser('Bob', slPaymailDomainInstance, rtConfig.slClientURL, ADMIN_XPRIV),
    createUser('Alice', slPaymailDomainInstance, rtConfig.slClientURL, ADMIN_XPRIV),
    createUser('Tom', pgPaymailDomainInstance, rtConfig.pgClientURL, ADMIN_XPRIV),
    createUser('Jerry', pgPaymailDomainInstance, rtConfig.pgClientURL, ADMIN_XPRIV),
  ]);

  [bobClient, aliceClient, tomClient, jerryClient] = await Promise.all([
    createUserClient(rtConfig.slClientURL, Bob.xpriv),
    createUserClient(rtConfig.slClientURL, Alice.xpriv),
    createUserClient(rtConfig.pgClientURL, Tom.xpriv),
    createUserClient(rtConfig.pgClientURL, Jerry.xpriv),
  ]);
}, TEST_TIMEOUT_MS);


afterAll(async () => {
  const deletionPromises: Promise<void>[] = [];
  if (Bob) {
    deletionPromises.push(removeRegisteredPaymail(adminSLClient, Bob.paymailId));
  }

  if (Alice) {
    deletionPromises.push(removeRegisteredPaymail(adminSLClient, Alice.paymailId));
  }

  if (Tom) {
    deletionPromises.push(removeRegisteredPaymail(adminPGClient, Tom.paymailId));
  }

  if (Jerry) {
    deletionPromises.push(removeRegisteredPaymail(adminPGClient, Jerry.paymailId));
  }

  await Promise.all(deletionPromises);
  deletionPromises.forEach((promise) =>
    expect(promise).resolves.not.toThrow()
  );
});

describe('TestRegression', () => {
  describe('Perform Transactions', () => {
    test.concurrent('Send money to Bob', async () => {
        const amountToSend = 3;
        await sendAndVerifyFunds(
          pgLeaderClient,
          bobClient,
          Bob.paymail,
          amountToSend,
        );
      },
      TEST_TIMEOUT_MS,
    );

    test.concurrent(
      'Send money to Tom',
      async () => {
        await sendAndVerifyFunds(
          slLeaderClient,
          tomClient,
          Tom.paymail,
          MINIMAL_FUNDS_PER_TRANSACTION,
        );
      },
      TEST_TIMEOUT_MS,
    );

    test(
      'Send money from Tom to Bob',
      async () => {
        const transaction = await sendFunds(
          bobClient,
          Tom.paymail,
          MINIMAL_FUNDS_PER_TRANSACTION,
        );
        expect(transaction.outputValue).toBeLessThanOrEqual(-1);

        const balanceOfTom = await getBalance(tomClient);
        expect(balanceOfTom).toBeGreaterThanOrEqual(2);

        const { content: transactionsOfTom } = await getTransactions(tomClient);
        expect(transactionsOfTom.length).toBeGreaterThanOrEqual(2);

        const balanceOfBob = await getBalance(bobClient);
        expect(balanceOfBob).toBeGreaterThanOrEqual(0);

        const { content: transactionsOfBob } = await getTransactions(bobClient);
        expect(transactionsOfBob.length).toBeGreaterThanOrEqual(2);
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe('SQLite User Operations instance for Bob and Alice', () => {

    test.concurrent('Bob should add Alice as contact', async () => {
        const contact = await addContact(bobClient, Alice.paymail, 'Alice', Bob.paymail);
        expect(contact).toBeDefined();
        const contacts = await getContacts(bobClient, Alice.paymail);
        expect(contacts).toHaveLength(1);
      },
      TEST_TIMEOUT_MS,
    );

    test('Alice should add Bob as contact', async () => {
        const contact = await addContact(aliceClient, Bob.paymail, 'Bob', Alice.paymail);
        expect(contact).toBeDefined();
        const contacts = await getContacts(aliceClient, Bob.paymail);
        expect(contacts).toHaveLength(1);
    },
      TEST_TIMEOUT_MS,
    );

    test('Bob should confirm contact between Bob and Alice', async () => {
        const totpForBob = await generateTotpForContact(aliceClient, Bob.paymail);
        expect(totpForBob).toBeDefined();
        await confirmContact(bobClient, Bob.paymail, Alice.paymail, totpForBob);
        const contact = await getContact(bobClient, Alice.paymail);
        expect(contact.status).toBe('confirmed');
      },
      TEST_TIMEOUT_MS,
    );

    test('Bob should unconfirm contact between Bob and Alice', async () => {
        await unconfirmContact(bobClient, Alice.paymail);
        const contact = await getContact(bobClient, Alice.paymail);
        expect(contact.status).toBe('unconfirmed');
      },
      TEST_TIMEOUT_MS,
    );

    test('Bob should remove Alice from contacts', async () => {
        await removeContact(bobClient, Alice.paymail);
        const contacts = await getContacts(bobClient, Alice.paymail);
        expect(contacts).toHaveLength(0);
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe('PostgresSOL User Operations instance for Tom and Jerry', () => {

    test.concurrent('Tom should add Jerry as contact', async () => {
        const contact = await addContact(tomClient, Jerry.paymail, 'Jerry', Tom.paymail);
        expect(contact).toBeDefined();
        const contacts = await getContacts(tomClient, Jerry.paymail);
        expect(contacts).toHaveLength(1);
      },
      TEST_TIMEOUT_MS,
    );

    test('Jerry should add Tom as contact', async () => {
        const contact = await addContact(jerryClient, Tom.paymail, 'Tom', Jerry.paymail);
        expect(contact).toBeDefined();
        const contacts = await getContacts(jerryClient, Tom.paymail);
        expect(contacts).toHaveLength(1);
      },
      TEST_TIMEOUT_MS,
    );

    test('Tom should confirm contact between Tom and Jerry', async () => {
        const totpForTom = await generateTotpForContact(jerryClient, Tom.paymail);
        expect(totpForTom).toBeDefined();
        await confirmContact(tomClient, Tom.paymail, Jerry.paymail, totpForTom);
        const contact = await getContact(tomClient, Jerry.paymail);
        expect(contact.status).toBe('confirmed');
      },
      TEST_TIMEOUT_MS,
    );

    test('Tom should unconfirm contact between Tom and Jerry', async () => {
        await unconfirmContact(tomClient, Jerry.paymail);
        const contact = await getContact(tomClient, Jerry.paymail);
        expect(contact.status).toBe('unconfirmed');
      },
      TEST_TIMEOUT_MS,
    );

    test('Tom should remove Jerry from contacts', async () => {
        await removeContact(tomClient, Jerry.paymail);
        const contacts = await getContacts(tomClient, Jerry.paymail);
        expect(contacts).toHaveLength(0);
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe('SQLite Admin Contact Operations (Bob and Alice)', () => {
    let BobId = '';
    test.concurrent('Admin should add Bob as contact', async () => {
        const newContact = {
            paymail: Bob.paymail,
            fullName: 'Bob',
            creatorPaymail: Bob.paymail,
        };
        const contact = await createContactAdmin(adminSLClient, Bob.paymail, newContact);
        expect(contact).toBeDefined();
        BobId = contact.id;
      },
      TEST_TIMEOUT_MS,
    );

    test('Admin should retrieve all contacts', async () => {
        const contacts = await getContactsAdmin(adminSLClient);
        expect(contacts).toContainEqual(expect.objectContaining({ paymail: Bob.paymail }));
      },
      TEST_TIMEOUT_MS,
    );

    test('Admin should update Bob contact name', async () => {
        const updatedContact = await updateContactAdmin(adminSLClient, BobId, 'Bob Updated');
        expect(updatedContact.fullName).toBe('Bob Updated');
      },
      TEST_TIMEOUT_MS,
    );

    test('Admin should remove Bob contact', async () => {
        await expect(deleteContactAdmin(adminSLClient, BobId)).resolves.not.toThrow();
      },
      TEST_TIMEOUT_MS,
    );

    test('Admin should confirm contact between Alice and Bob', async () => {
        const aliceContact = await addContact(bobClient, Alice.paymail, 'Alice', Bob.paymail);
        expect(aliceContact).toBeDefined();
        const bobContact = await addContact(aliceClient, Bob.paymail, 'Bob', Alice.paymail);
        expect(bobContact).toBeDefined();

        await confirmContacts(adminSLClient, Alice.paymail, Bob.paymail);
        const contacts = await getContactsAdmin(adminSLClient);
        expect(contacts.find(c => c.paymail === Bob.paymail)?.status).toBe('confirmed');
        expect(contacts.find(c => c.paymail === Alice.paymail)?.status).toBe('confirmed');
      },
      TEST_TIMEOUT_MS,
    );
});

  describe('PostgreSQL Admin Contact Operations (Tom and Jerry)', () => {
    let TomId = '';
    test.concurrent('Admin should add Tom as contact', async () => {
        const newContact = {
            paymail: Tom.paymail,
            fullName: 'Tom',
            creatorPaymail: Tom.paymail,
        };
        const contact = await createContactAdmin(adminPGClient, Tom.paymail, newContact);
        expect(contact).toBeDefined();
        TomId = contact.id;
      },
      TEST_TIMEOUT_MS,
    );

    test('Admin should retrieve all contacts', async () => {
        const contacts = await getContactsAdmin(adminPGClient);
        expect(contacts).toContainEqual(expect.objectContaining({ paymail: Tom.paymail }));
      },
      TEST_TIMEOUT_MS,
    );

    test('Admin should update Tom contact name', async () => {
        const updatedContact = await updateContactAdmin(adminPGClient, TomId, 'Tom Updated');
        expect(updatedContact.fullName).toBe('Tom Updated');
      },
      TEST_TIMEOUT_MS,
    );

    test('Admin should remove Tom contact', async () => {
      await expect(deleteContactAdmin(adminPGClient, TomId)).resolves.not.toThrow();
      },
      TEST_TIMEOUT_MS,
    );

    test('Admin should confirm contact between Tom and Jerry', async () => {
        const jerryContact = await addContact(tomClient, Jerry.paymail, 'Jerry', Tom.paymail);
        expect(jerryContact).toBeDefined();
        const tomContact = await addContact(jerryClient, Tom.paymail, 'Tom', Jerry.paymail);
        expect(tomContact).toBeDefined();

        await confirmContacts(adminPGClient, Jerry.paymail, Tom.paymail);
        const contacts = await getContactsAdmin(adminPGClient);
        expect(contacts.find(c => c.paymail === Tom.paymail)?.status).toBe('confirmed');
        expect(contacts.find(c => c.paymail === Jerry.paymail)?.status).toBe('confirmed');
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe('SQLite Access Key Management', () => {
    let testAccessKeyId: string;
    test.concurrent('Admin should fetch all access keys', async () => {
        const accessKey = await generateAccessKey(aliceClient);
        expect(accessKey).toBeDefined();
        expect(accessKey.id).toBeDefined();

        const accessKeys = await getAccessKeysAdmin(adminSLClient);
        expect(Array.isArray(accessKeys)).toBe(true);
        expect(accessKeys.length).toBeGreaterThanOrEqual(1);
      },
      TEST_TIMEOUT_MS,
    );

    test('User should generate an access key', async () => {
        const accessKey = await generateAccessKey(bobClient);
        expect(accessKey).toBeDefined();
        expect(accessKey.id).toBeDefined();
        testAccessKeyId = accessKey.id;
      },
      TEST_TIMEOUT_MS,
    );

    test('User should fetch all access keys', async () => {
        const accessKeys = await getAccessKeys(bobClient);
        expect(Array.isArray(accessKeys)).toBe(true);
        expect(accessKeys.length).toBeGreaterThanOrEqual(1);
      },
      TEST_TIMEOUT_MS,
    );

    test('User should fetch an access key by ID', async () => {
      if (!testAccessKeyId) return;
        const accessKey = await getAccessKeyById(bobClient, testAccessKeyId);
        expect(accessKey).toBeDefined();
        expect(accessKey.id).toBe(testAccessKeyId);
      },
      TEST_TIMEOUT_MS,
    );

    test('User should revoke an access key', async () => {
        if (!testAccessKeyId) return;
        await expect(revokeAccessKey(bobClient, testAccessKeyId)).resolves.not.toThrow();
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe('PostgresSQL Access Key Management', () => {
    let testAccessKeyId: string;
    test.concurrent('Admin should fetch all access keys', async () => {
        const accessKey = await generateAccessKey(jerryClient);
        expect(accessKey).toBeDefined();
        expect(accessKey.id).toBeDefined();

        const accessKeys = await getAccessKeysAdmin(adminPGClient);
        expect(Array.isArray(accessKeys)).toBe(true);
        expect(accessKeys.length).toBeGreaterThanOrEqual(1);
        expect(accessKeys[0].id).toBe(accessKey.id);
      },
      TEST_TIMEOUT_MS,
    );
    test('User should generate an access key', async () => {
        const accessKey = await generateAccessKey(tomClient);
        expect(accessKey).toBeDefined();
        expect(accessKey.id).toBeDefined();
        testAccessKeyId = accessKey.id;
      },
      TEST_TIMEOUT_MS,
    );

    test('User should fetch all access keys', async () => {
        const accessKeys = await getAccessKeys(tomClient);
        expect(Array.isArray(accessKeys)).toBe(true);
        expect(accessKeys.length).toBeGreaterThanOrEqual(1);
      },
      TEST_TIMEOUT_MS,
    );

    test('User should fetch an access key by ID', async () => {
        if (!testAccessKeyId) return;
        const accessKey = await getAccessKeyById(tomClient, testAccessKeyId);
        expect(accessKey).toBeDefined();
        expect(accessKey.id).toBe(testAccessKeyId);
      },
      TEST_TIMEOUT_MS,
    );

    test('User should revoke an access key', async () => {
        if (!testAccessKeyId) return;
        await expect(revokeAccessKey(tomClient, testAccessKeyId)).resolves.not.toThrow();
      },
      TEST_TIMEOUT_MS,
    );
  });
});

import fetchMock from 'jest-fetch-mock';
import { SPVWalletUserAPI } from '../user-api';
import { SPVWalletAdminAPI } from '../admin-api';
import {
  createUserClient,
  createAdminClient,
  createUserClientWithAccessKey,
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
  unconfirmContact as unconfirmContactAdmin,
} from './admin_api_contacts';
import {
  getAccessKeysAdmin,
  getAccessKeys,
  generateAccessKey,
  getAccessKeyById,
  revokeAccessKey,
} from './access_key';
import { Contact } from '../types';

const MINIMAL_FUNDS_PER_TRANSACTION = 2;
const TEST_TIMEOUT_MS = 2 * 60 * 1000;
const ADMIN_XPRIV =
  'xprv9s21ZrQH143K3CbJXirfrtpLvhT3Vgusdo8coBritQ3rcS7Jy7sxWhatuxG5h2y1Cqj8FKmPp69536gmjYRpfga2MJdsGyBsnB12E19CESK';
const ADMIN_XPUB =
  'xpub661MyMwAqRbcFgfmdkPgE2m5UjHXu9dj124DbaGLSjaqVESTWfCD4VuNmEbVPkbYLCkykwVZvmA8Pbf8884TQr1FgdG2nPoHR8aB36YdDQh';
const TOTP_DIGITS = 4;
const TOTP_PERIOD = 1200;

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
  const metadata = {
    test: 'regression',
  };
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
        const contact = await bobClient.upsertContact(Alice.paymail, 'Alice', Bob.paymail, metadata);
        expect(contact).toBeDefined();
        const contacts = await bobClient.contacts({ paymail: Alice.paymail }, metadata, {});
        expect(contacts.content).toHaveLength(1);
      },
      TEST_TIMEOUT_MS,
    );

    test('Alice should add Bob as contact', async () => {
        const contact = await aliceClient.upsertContact(Bob.paymail, 'Bob', Alice.paymail, metadata);
        expect(contact).toBeDefined();
        const contacts = await aliceClient.contacts({ paymail: Bob.paymail }, metadata, {});
        expect(contacts.content).toHaveLength(1);
    },
      TEST_TIMEOUT_MS,
    );

    test('Bob should confirm contact between Bob and Alice', async () => {
        const contact = await aliceClient.contactWithPaymail(Bob.paymail);
        expect(contact).toBeDefined
        const totpForBob = aliceClient.generateTotpForContact(contact);
        expect(totpForBob).toBeDefined();
        await bobClient.confirmContact(contact, Alice.paymail, totpForBob, TOTP_PERIOD, TOTP_DIGITS);
        const contactConfirmed = await bobClient.contactWithPaymail(Alice.paymail);
        expect(contactConfirmed.status).toBe('confirmed');
      },
      TEST_TIMEOUT_MS,
    );

    test('Bob should unconfirm contact between Bob and Alice', async () => {
        await bobClient.unconfirmContact(Alice.paymail);
        const unconfimedContact = await bobClient.contactWithPaymail(Alice.paymail);
        expect(unconfimedContact.status).toBe('unconfirmed');
      },
      TEST_TIMEOUT_MS,
    );

    test('Bob should remove Alice from contacts', async () => {
        await bobClient.removeContact(Alice.paymail);
        const contacts = await bobClient.contacts({ paymail: Alice.paymail }, metadata, {});
        expect(contacts).toHaveLength(0);
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe('PostgresSOL User Operations instance for Tom and Jerry', () => {

    test.concurrent('Tom should add Jerry as contact', async () => {
        const contact = await tomClient.upsertContact(Jerry.paymail, 'Jerry', Tom.paymail, metadata);
        expect(contact).toBeDefined();
        const contacts = await tomClient.contacts({ paymail: Jerry.paymail }, metadata, {});
        expect(contacts.content).toHaveLength(1);
      },
      TEST_TIMEOUT_MS,
    );

    test('Jerry should add Tom as contact', async () => {
        const contact = await jerryClient.upsertContact(Tom.paymail, 'Tom', Jerry.paymail, metadata);
        expect(contact).toBeDefined();
        const contacts = await jerryClient.contacts({ paymail: Tom.paymail }, metadata, {});
        expect(contacts.content).toHaveLength(1);
      },
      TEST_TIMEOUT_MS,
    );

    test('Tom should confirm contact between Tom and Jerry', async () => {
        const contact = await jerryClient.contactWithPaymail(Tom.paymail);
        expect(contact).toBeDefined();
        const totpForTom = jerryClient.generateTotpForContact(contact);
        expect(totpForTom).toBeDefined();
        await tomClient.confirmContact(contact, Jerry.paymail, totpForTom, TOTP_PERIOD, TOTP_DIGITS);
        const contactConfirmed = await tomClient.contactWithPaymail(Jerry.paymail);
        expect(contactConfirmed.status).toBe('confirmed');
      },
      TEST_TIMEOUT_MS,
    );

    test('Tom should unconfirm contact between Tom and Jerry', async () => {
        await tomClient.unconfirmContact(Jerry.paymail);
        const unconfimedContact = await tomClient.contactWithPaymail(Jerry.paymail);
        expect(unconfimedContact.status).toBe('unconfirmed');
      },
      TEST_TIMEOUT_MS,
    );

    test('Tom should remove Jerry from contacts', async () => {
        await tomClient.removeContact(Jerry.paymail);
        const contacts = await tomClient.contacts({ paymail: Jerry.paymail }, metadata, {});
        expect(contacts).toHaveLength(0);
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe('SQLite Admin Contact Operations (Bob and Alice)', () => {
    let BobId = '';
    let AliceContact: Contact | undefined;
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
        AliceContact = contacts.find(c => c.paymail === Alice.paymail);
        expect(AliceContact?.status).toBe('confirmed');
      },
      TEST_TIMEOUT_MS,
    );

    test('Admin should unconfim Alice contact', async () => {
        if (!AliceContact) return;
        await unconfirmContactAdmin(adminSLClient, AliceContact.id);
        const unconfimedContact = await getContact(bobClient, Alice.paymail);
        expect(unconfimedContact.status).toBe('unconfirmed');
      },
      TEST_TIMEOUT_MS,
    );
});

  describe('PostgreSQL Admin Contact Operations (Tom and Jerry)', () => {
    let TomId = '';
    let JerryContact: Contact | undefined;
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
        JerryContact = contacts.find(c => c.paymail === Jerry.paymail);
        expect(JerryContact?.status).toBe('confirmed');
      },
      TEST_TIMEOUT_MS,
    );

    test('Admin should unconfim Jerry contact', async () => {
        if (!JerryContact) return;
        await unconfirmContactAdmin(adminPGClient, JerryContact.id);
        const unconfimedContact = await getContact(tomClient, Jerry.paymail);
        expect(unconfimedContact.status).toBe('unconfirmed');
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe('SQLite Access Key Management', () => {
    let testAccessKeyId: string;
    let testAccessKey: string | undefined;
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
        testAccessKey = accessKey.key;
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

    test('User should login via access key and be able to list transactions', async () => {
        if (!testAccessKey) return;
        const client = createUserClientWithAccessKey(rtConfig.slClientURL, testAccessKey);
        const txs = await client.transactions({}, {}, {});
        expect(txs).toBeDefined();
        expect(txs.content).toBeDefined();
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
    let testAccessKey: string | undefined
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
        testAccessKey = accessKey.key
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

    test('User should login via access key and be able to list transactions', async () => {
      if (!testAccessKey) return;
        const client = createUserClientWithAccessKey(rtConfig.pgClientURL, testAccessKey);
        const txs = await client.transactions({}, {}, {});
        expect(txs).toBeDefined();
        expect(txs.content).toBeDefined();
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

import fetchMock from 'jest-fetch-mock';
import {
  createUser,
  getBalance,
  getEnvVariables,
  getPaymailDomain,
  getTransactions,
  RegressionTestConfig,
  RegressionTestUser,
  removeRegisteredPaymail,
  sendFunds,
  addContact,
  getContact,
  confirmContact,
  removeContact,
  unconfirmContact,
  getContacts,
  generateTotp as generateTotpForContact,
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
  confirmContacts as confirmContactsAdmin,
} from './admin_api_contacts';

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
let Alice: RegressionTestUser;
let Bob: RegressionTestUser;
// Tom & Jerry are users for PostgreSQL instance
let Tom: RegressionTestUser;
let Jerry: RegressionTestUser;

let rtConfig: RegressionTestConfig;

const sendAndVerifyFunds = async (
  fromInstance: string,
  fromXPriv: string,
  toPaymail: string,
  howMuch: number,
  targetURL: string,
  targetXPriv: string,
) => {
  const transaction = await sendFunds(fromInstance, fromXPriv, toPaymail, howMuch);
  expect(transaction.outputValue).toBeLessThanOrEqual(-1);

  const balance = await getBalance(targetURL, targetXPriv);
  expect(balance).toBeGreaterThanOrEqual(1);

  const { content: transactions } = await getTransactions(targetURL, targetXPriv);
  expect(transactions.length).toBeGreaterThanOrEqual(1);
};

beforeAll(() => {
  fetchMock.disableMocks();
  rtConfig = getEnvVariables();
  expect(rtConfig).toBeDefined();
});

afterAll(async () => {
  if (Bob) {
    await expect(removeRegisteredPaymail(Bob.paymailId, rtConfig.slClientURL, ADMIN_XPRIV)).resolves.not.toThrow();
  }

  if (Alice) {
    await expect(removeRegisteredPaymail(Alice.paymailId, rtConfig.slClientURL, ADMIN_XPRIV)).resolves.not.toThrow();
  }

  if (Tom) {
    await expect(removeRegisteredPaymail(Tom.paymailId, rtConfig.pgClientURL, ADMIN_XPRIV)).resolves.not.toThrow();
  }

  if (Jerry) {
    await expect(removeRegisteredPaymail(Jerry.paymailId, rtConfig.pgClientURL, ADMIN_XPRIV)).resolves.not.toThrow();
  }
});

describe('TestRegression', () => {
  describe('Initialize Shared Configurations', () => {
    test('Should get sharedConfig for instance one', async () => {
      slPaymailDomainInstance = await getPaymailDomain(ADMIN_XPRIV, rtConfig.slClientURL);
      expect(slPaymailDomainInstance).not.toBe('');
    });

    test('Should get sharedConfig for instance two', async () => {
      pgPaymailDomainInstance = await getPaymailDomain(ADMIN_XPRIV, rtConfig.pgClientURL);
      expect(pgPaymailDomainInstance).not.toBe('');
    });
  });

  describe('Create Users', () => {
    test('Should create user for instance one', async () => {
      const userName = 'Bob';
      Bob = await createUser(userName, slPaymailDomainInstance, rtConfig.slClientURL, ADMIN_XPRIV);
    });

    test('Should create user for instance one', async () => {
      const userName = 'Alice';
      Alice = await createUser(userName, slPaymailDomainInstance, rtConfig.slClientURL, ADMIN_XPRIV);
    });

    test('Should create user for instance two', async () => {
      const userName = 'Tom';
      Tom = await createUser(userName, pgPaymailDomainInstance, rtConfig.pgClientURL, ADMIN_XPRIV);
    });

    test('Should create user for instance two', async () => {
      const userName = 'Jerry';
      Jerry = await createUser(userName, pgPaymailDomainInstance, rtConfig.pgClientURL, ADMIN_XPRIV);
    });
  });

  describe('Perform Transactions', () => {
    test(
      'Send money to instance 1',
      async () => {
        const amountToSend = 3;

        await sendAndVerifyFunds(
          rtConfig.pgClientURL,
          rtConfig.pgClientLeaderXPriv,
          Bob.paymail,
          amountToSend,
          rtConfig.slClientURL,
          Bob.xpriv,
        );
      },
      TEST_TIMEOUT_MS,
    );

    test(
      'Send money to Tom',
      async () => {
        await sendAndVerifyFunds(
          rtConfig.slClientURL,
          rtConfig.slClientLeaderXPriv,
          Tom.paymail,
          MINIMAL_FUNDS_PER_TRANSACTION,
          rtConfig.pgClientURL,
          Tom.xpriv,
        );
      },
      TEST_TIMEOUT_MS,
    );

    test(
      'Send money from Tom to Bob',
      async () => {
        const transaction = await sendFunds(
          rtConfig.slClientURL,
          Bob.xpriv,
          Tom.paymail,
          MINIMAL_FUNDS_PER_TRANSACTION,
        );
        expect(transaction.outputValue).toBeLessThanOrEqual(-1);

        const balanceOfTom = await getBalance(rtConfig.pgClientURL, Tom.xpriv);
        expect(balanceOfTom).toBeGreaterThanOrEqual(2);

        const { content: transactionsOfTom } = await getTransactions(rtConfig.pgClientURL, Tom.xpriv);
        expect(transactionsOfTom.length).toBeGreaterThanOrEqual(2);

        const balanceOfBob = await getBalance(rtConfig.slClientURL, Bob.xpriv);
        expect(balanceOfBob).toBeGreaterThanOrEqual(0);

        const { content: transactionsOfBob } = await getTransactions(rtConfig.slClientURL, Bob.xpriv);
        expect(transactionsOfBob.length).toBeGreaterThanOrEqual(2);
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe('SQLite User Operations instance for Bob and Alice', () => {

    test('Bob should add Alice as contact', async () => {
      const contact = await addContact(rtConfig.slClientURL, Bob.xpriv, Alice.paymail, 'Alice', Bob.paymail);
      expect(contact).toBeDefined();
      const contacts = await getContacts(rtConfig.slClientURL, Bob.xpriv, Alice.paymail);
      expect(contacts).toHaveLength(1);
    });

    test('Alice should add Bob as contact', async () => {
      const contact = await addContact(rtConfig.slClientURL, Alice.xpriv, Bob.paymail, 'Bob', Alice.paymail);
      expect(contact).toBeDefined();
      const contacts = await getContacts(rtConfig.slClientURL, Alice.xpriv, Bob.paymail);
      expect(contacts).toHaveLength(1);
    });

    test('Bob should confirm contact between Bob and Alice', async () => {
      const totpForBob = await generateTotpForContact(rtConfig.slClientURL, Alice.xpriv, Bob.paymail);
      expect(totpForBob).toBeDefined();
      await confirmContact(rtConfig.slClientURL, Bob.xpriv, Bob.paymail, Alice.paymail, totpForBob);
      const contact = await getContact(rtConfig.slClientURL, Bob.xpriv, Alice.paymail);
      expect(contact.status).toBe('confirmed');
    });

    test('Bob should unconfirm contact between Bob and Alice', async () => {
      await unconfirmContact(rtConfig.slClientURL, Bob.xpriv, Alice.paymail);
      const contact = await getContact(rtConfig.slClientURL, Bob.xpriv, Alice.paymail);
      expect(contact.status).toBe('unconfirmed');
    });

    test('Bob should remove Alice from contacts', async () => {
      await removeContact(rtConfig.slClientURL, Bob.xpriv, Alice.paymail);
      const contacts = await getContacts(rtConfig.slClientURL, Bob.xpriv, Alice.paymail);
      expect(contacts).toHaveLength(0);
    });
  });

  describe('PostgresSOL User Operations instance for Tom and Jerry', () => {

    test('Tom should add Jerry as contact', async () => {
      const contact = await addContact(rtConfig.pgClientURL, Tom.xpriv, Jerry.paymail, 'Jerry', Tom.paymail);
      expect(contact).toBeDefined();
      const contacts = await getContacts(rtConfig.pgClientURL, Tom.xpriv, Jerry.paymail);
      expect(contacts).toHaveLength(1);
    });

    test('Jerry should add Tom as contact', async () => {
      const contact = await addContact(rtConfig.pgClientURL, Jerry.xpriv, Tom.paymail, 'Tom', Jerry.paymail);
      expect(contact).toBeDefined();
      const contacts = await getContacts(rtConfig.pgClientURL, Jerry.xpriv, Tom.paymail);
      expect(contacts).toHaveLength(1);
    });

    test('Tom should confirm contact between Tom and Jerry', async () => {
      const totpForTom = await generateTotpForContact(rtConfig.pgClientURL, Jerry.xpriv, Tom.paymail);
      expect(totpForTom).toBeDefined();
      await confirmContact(rtConfig.pgClientURL, Tom.xpriv, Tom.paymail, Jerry.paymail, totpForTom);
      const contact = await getContact(rtConfig.pgClientURL, Tom.xpriv, Jerry.paymail);
      expect(contact.status).toBe('confirmed');
    });

    test('Tom should unconfirm contact between Tom and Jerry', async () => {
      await unconfirmContact(rtConfig.pgClientURL, Tom.xpriv, Jerry.paymail);
      const contact = await getContact(rtConfig.pgClientURL, Tom.xpriv, Jerry.paymail);
      expect(contact.status).toBe('unconfirmed');
    });

    test('Tom should remove Jerry from contacts', async () => {
      await removeContact(rtConfig.pgClientURL, Tom.xpriv, Jerry.paymail);
      const contacts = await getContacts(rtConfig.pgClientURL, Tom.xpriv, Jerry.paymail);
      expect(contacts).toHaveLength(0);
    });
  });

  describe('SQLite Admin Contact Operations (Bob and Alice)', () => {
    let BobId = '';
    test('Admin should add Bob as contact', async () => {
        const newContact = {
            paymail: Bob.paymail,
            fullName: 'Bob',
            creatorPaymail: Bob.paymail,
        };
        const contact = await createContactAdmin(rtConfig.slClientURL, ADMIN_XPRIV, Bob.paymail, newContact);
        expect(contact).toBeDefined();
        BobId = contact.id;
    });

    test('Admin should retrieve all contacts', async () => {
        const contacts = await getContactsAdmin(rtConfig.slClientURL, ADMIN_XPRIV);
        expect(contacts).toContainEqual(expect.objectContaining({ paymail: Bob.paymail }));
    });

    test('Admin should update Bob contact name', async () => {
      const updatedContact = await updateContactAdmin(rtConfig.slClientURL,ADMIN_XPRIV, BobId, 'Bob Updated');
      expect(updatedContact.fullName).toBe('Bob Updated');
    });

    test('Admin should remove Bob contact', async () => {
      expect(deleteContactAdmin(rtConfig.slClientURL, ADMIN_XPRIV, BobId)).resolves.not.toThrow();
    });

    test('Admin should confirm contact between Alice and Bob', async () => {
        const aliceContact = await addContact(rtConfig.slClientURL, Bob.xpriv, Alice.paymail, 'Alice', Bob.paymail);
        expect(aliceContact).toBeDefined();
        const bobContact = await addContact(rtConfig.slClientURL, Alice.xpriv, Bob.paymail, 'Bob', Alice.paymail);
        expect(bobContact).toBeDefined();

        await confirmContactsAdmin(rtConfig.slClientURL, ADMIN_XPRIV, Alice.paymail, Bob.paymail);
        const contacts = await getContactsAdmin(rtConfig.slClientURL, ADMIN_XPRIV);
        expect(contacts.find(c => c.paymail === Bob.paymail)?.status).toBe('confirmed');
        expect(contacts.find(c => c.paymail === Alice.paymail)?.status).toBe('confirmed');
    });
});

  describe('PostgreSQL Admin Contact Operations (Tom and Jerry)', () => {
    let TomId = '';
    test('Admin should add Tom as contact', async () => {
        const newContact = {
            paymail: Tom.paymail,
            fullName: 'Tom',
            creatorPaymail: Tom.paymail,
        };
        const contact = await createContactAdmin(rtConfig.pgClientURL, ADMIN_XPRIV, Tom.paymail, newContact);
        expect(contact).toBeDefined();
        TomId = contact.id;
    });

    test('Admin should retrieve all contacts', async () => {
        const contacts = await getContactsAdmin(rtConfig.pgClientURL, ADMIN_XPRIV);
        expect(contacts).toContainEqual(expect.objectContaining({ paymail: Tom.paymail }));
    });

    test('Admin should update Tom contact name', async () => {
      const updatedContact = await updateContactAdmin(rtConfig.pgClientURL,ADMIN_XPRIV, TomId, 'Tom Updated');
      expect(updatedContact.fullName).toBe('Tom Updated');
    });

    test('Admin should remove Tom contact', async () => {
      expect(deleteContactAdmin(rtConfig.pgClientURL, ADMIN_XPRIV, TomId)).resolves.not.toThrow();
    });

    test('Admin should confirm contact between Tom and Jerry', async () => {
        const jerryContact = await addContact(rtConfig.pgClientURL, Tom.xpriv, Jerry.paymail, 'Jerry', Tom.paymail);
        expect(jerryContact).toBeDefined();
        const tomContact = await addContact(rtConfig.pgClientURL, Jerry.xpriv, Tom.paymail, 'Tom', Jerry.paymail);
        expect(tomContact).toBeDefined();

        await confirmContactsAdmin(rtConfig.pgClientURL, ADMIN_XPRIV, Jerry.paymail, Tom.paymail);
        const contacts = await getContactsAdmin(rtConfig.pgClientURL, ADMIN_XPRIV);
        expect(contacts.find(c => c.paymail === Tom.paymail)?.status).toBe('confirmed');
        expect(contacts.find(c => c.paymail === Jerry.paymail)?.status).toBe('confirmed');
    });
  });
});

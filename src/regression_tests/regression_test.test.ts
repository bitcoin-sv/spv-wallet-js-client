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
  validateTotp,
  confirmContact,
  removeContact,
  unconfirmContact,
  generateTotp as generateTotpForContact,
} from './utils';

const MINIMAL_FUNDS_PER_TRANSACTION = 2;
const TEST_TIMEOUT_MS = 2 * 60 * 1000;
const ADMIN_XPRIV =
  'xprv9s21ZrQH143K3CbJXirfrtpLvhT3Vgusdo8coBritQ3rcS7Jy7sxWhatuxG5h2y1Cqj8FKmPp69536gmjYRpfga2MJdsGyBsnB12E19CESK';
const ADMIN_XPUB =
  'xpub661MyMwAqRbcFgfmdkPgE2m5UjHXu9dj124DbaGLSjaqVESTWfCD4VuNmEbVPkbYLCkykwVZvmA8Pbf8884TQr1FgdG2nPoHR8aB36YdDQh';

let paymailDomainInstanceOne = '';
let paymailDomainInstanceTwo = '';
let userOne: RegressionTestUser;
let userOneContact: RegressionTestUser;
let userTwo: RegressionTestUser;
let userTwoContact: RegressionTestUser;
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
  if (userOne) {
    await expect(removeRegisteredPaymail(userOne.paymailId, rtConfig.clientOneURL, ADMIN_XPRIV)).resolves.not.toThrow();
  }

  if (userOneContact) {
    await expect(removeRegisteredPaymail(userOneContact.paymailId, rtConfig.clientOneURL, ADMIN_XPRIV)).resolves.not.toThrow();
  }

  if (userTwo) {
    await expect(removeRegisteredPaymail(userTwo.paymailId, rtConfig.clientTwoURL, ADMIN_XPRIV)).resolves.not.toThrow();
  }

  if (userTwoContact) {
    await expect(removeRegisteredPaymail(userTwoContact.paymailId, rtConfig.clientTwoURL, ADMIN_XPRIV)).resolves.not.toThrow();
  }
});

describe('TestRegression', () => {
  describe('Initialize Shared Configurations', () => {
    test('Should get sharedConfig for instance one', async () => {
      paymailDomainInstanceOne = await getPaymailDomain(ADMIN_XPRIV, rtConfig.clientOneURL);
      expect(paymailDomainInstanceOne).not.toBe('');
    });

    test('Should get sharedConfig for instance two', async () => {
      paymailDomainInstanceTwo = await getPaymailDomain(ADMIN_XPRIV, rtConfig.clientTwoURL);
      expect(paymailDomainInstanceTwo).not.toBe('');
    });
  });

  describe('Create Users', () => {
    test('Should create user for instance one', async () => {
      const userName = 'instanceOneUser1';
      userOne = await createUser(userName.toLowerCase(), paymailDomainInstanceOne, rtConfig.clientOneURL, ADMIN_XPRIV);
    });

    test('Should create user for instance two', async () => {
      const userName = 'instanceTwoUser1';
      userTwo = await createUser(userName.toLowerCase(), paymailDomainInstanceTwo, rtConfig.clientTwoURL, ADMIN_XPRIV);
    });

    test('Should create user for instance one', async () => {
      const userName = 'instanceOneUser2';
      userOneContact = await createUser(userName.toLowerCase(), paymailDomainInstanceOne, rtConfig.clientOneURL, ADMIN_XPRIV);
    });

    test('Should create user for instance two', async () => {
      const userName = 'instanceTwoUser2';
      userTwoContact = await createUser(userName.toLowerCase(), paymailDomainInstanceTwo, rtConfig.clientTwoURL, ADMIN_XPRIV);
    });
  });

  describe('Perform Transactions', () => {
    test(
      'Send money to instance 1',
      async () => {
        const amountToSend = 3;

        await sendAndVerifyFunds(
          rtConfig.clientTwoURL,
          rtConfig.clientTwoLeaderXPriv,
          userOne.paymail,
          amountToSend,
          rtConfig.clientOneURL,
          userOne.xpriv,
        );
      },
      TEST_TIMEOUT_MS,
    );

    test(
      'Send money to instance 2',
      async () => {
        await sendAndVerifyFunds(
          rtConfig.clientOneURL,
          rtConfig.clientOneLeaderXPriv,
          userTwo.paymail,
          MINIMAL_FUNDS_PER_TRANSACTION,
          rtConfig.clientTwoURL,
          userTwo.xpriv,
        );
      },
      TEST_TIMEOUT_MS,
    );

    test(
      'Send money from instance 1 to instance 2',
      async () => {
        const transaction = await sendFunds(
          rtConfig.clientOneURL,
          userOne.xpriv,
          userTwo.paymail,
          MINIMAL_FUNDS_PER_TRANSACTION,
        );
        expect(transaction.outputValue).toBeLessThanOrEqual(-1);

        const balanceInstance2 = await getBalance(rtConfig.clientTwoURL, userTwo.xpriv);
        expect(balanceInstance2).toBeGreaterThanOrEqual(2);

        const { content: transactionsInstance2 } = await getTransactions(rtConfig.clientTwoURL, userTwo.xpriv);
        expect(transactionsInstance2.length).toBeGreaterThanOrEqual(2);

        const balanceInstance1 = await getBalance(rtConfig.clientOneURL, userOne.xpriv);
        expect(balanceInstance1).toBeGreaterThanOrEqual(0);

        const { content: transactionsInstance1 } = await getTransactions(rtConfig.clientOneURL, userOne.xpriv);
        expect(transactionsInstance1.length).toBeGreaterThanOrEqual(2);
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe('User Operations instance one', () => {
    let userOneTotpForContact: string;

    test('UserOne should add UserOneContact as contact', async () => {
      await addContact(rtConfig.clientOneURL, userOne.xpriv, userOneContact.paymail, userOne.paymail, 'Bob');
      const contact = await getContact(rtConfig.clientOneURL, userOne.xpriv, userOneContact.paymail);
      expect(contact).toBeDefined();
      expect(contact.paymail).toBe(userOneContact.paymail);
    });

    test('UserOne should validate contact (UserOneContact) using TOTP', async () => {
      userOneTotpForContact = await generateTotpForContact(rtConfig.clientOneURL, userOne.xpriv, userOneContact.paymail);
      expect(userOneTotpForContact).toBeDefined();
      const isValid = await validateTotp(rtConfig.clientOneURL, userOne.xpriv, userOne.paymail, userOneTotpForContact);
      expect(isValid).toBe(true);
    });

    test('UserOne should confirm contact between UserOne and UserOneContact', async () => {
      expect(userOneTotpForContact).toBeDefined();
      const isConfirmed = await confirmContact(rtConfig.clientOneURL, userOne.xpriv, userOne.paymail, userOneContact.paymail, userOneTotpForContact);
      expect(isConfirmed).toBe(true);
    });

    test('UserOne should unconfirm contact between UserOne and UserOneContact', async () => {
      await unconfirmContact(rtConfig.clientOneURL, userOne.xpriv, userOneContact.paymail);
      const contact = await getContact(rtConfig.clientOneURL, userOne.xpriv, userOneContact.paymail);
      expect(contact).toBeDefined();
    });

    test('UserOne should remove UserOneContact from contacts', async () => {
      await removeContact(rtConfig.clientOneURL, userOne.xpriv, userOneContact.paymail);
      const contact = await getContact(rtConfig.clientOneURL, userOne.xpriv, userOneContact.paymail);
      expect(contact).toBeUndefined();
    });
  });

  // describe('User Operations for Instance Two', () => {
  //   test('UserTwo should add UserTwoContact as contact', async () => {
  //     await addContact(rtConfig.clientTwoURL, userTwo.xpriv, userTwoContact.paymail, userTwo.paymail, 'Alice');
  //     const contact = await getContact(rtConfig.clientTwoURL, userTwo.xpriv, userTwoContact.paymail);
  //     expect(contact).toBeDefined();
  //     expect(contact.paymail).toBe(userTwoContact.paymail);
  //   });
  //   test('UserTwo should validate contact (UserTwoContact) using TOTP', async () => {
  //     const generatedTotp = await generateTotp(rtConfig.clientTwoURL, userTwo.xpriv, userTwoContact.paymail);
  //     expect(generatedTotp).toBeDefined();
  //     const isValid = await validateTotp(rtConfig.clientTwoURL, userTwo.xpriv, userTwoContact.paymail, generatedTotp);
  //     expect(isValid).toBe(true);
  //   });
  //   test('Admin should confirm contact between UserTwo and UserTwoContact', async () => {
  //     await confirmContact(rtConfig.clientTwoURL, ADMIN_XPRIV, userTwo.paymail, userTwoContact.paymail);
  //     const contact = await getContact(rtConfig.clientTwoURL, userTwo.xpriv, userTwoContact.paymail);
  //     expect(contact).toBeDefined();
  //   });
  //   test('UserTwo should remove UserTwoContact', async () => {
  //     await removeContact(rtConfig.clientTwoURL, userTwo.xpriv, userTwoContact.paymail);
  //     const contact = await getContact(rtConfig.clientTwoURL, userTwo.xpriv, userTwoContact.paymail);
  //     expect(contact).toBeUndefined();
  //   });
  // });
});

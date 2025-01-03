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
let userTwo: RegressionTestUser;
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
    await expect(
      removeRegisteredPaymail(userOne.paymail, userOne.paymailId, rtConfig.clientOneURL, ADMIN_XPRIV),
    ).resolves.not.toThrow();
  }

  if (userTwo) {
    await expect(
      removeRegisteredPaymail(userTwo.paymail, userTwo.paymailId, rtConfig.clientTwoURL, ADMIN_XPRIV),
    ).resolves.not.toThrow();
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
      userOne = await createUser(userName, paymailDomainInstanceOne, rtConfig.clientOneURL, ADMIN_XPRIV);
    });

    test('Should create user for instance two', async () => {
      const userName = 'instanceTwoUser1';
      userTwo = await createUser(userName, paymailDomainInstanceTwo, rtConfig.clientTwoURL, ADMIN_XPRIV);
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
});

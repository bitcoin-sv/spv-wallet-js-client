import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey } from './example-keys.js';

interface VerificationResults {
  bobValidatedAlicesTotp: boolean;
  aliceValidatedBobsTotp: boolean;
}

const CONFIG = {
  TOTP_DIGITS: 4,
  TOTP_PERIOD: 1200,
  server: 'http://localhost:3003',
  // Replace this with your own domain - where you host your paymail server.
  paymailDomain: 'wojtek.test.4chain.space'
};

if (!CONFIG.paymailDomain || CONFIG.paymailDomain === 'example.com') {
  console.error('Please replace the paymail domain with your own domain.');
  process.exit(1);
}

// You can use these credentials or replace them with your own - if Alice and Bob are already registered.
const CREDENTIALS = {
  alice: {
    xPriv: 'xprv9s21ZrQH143K2jMwweKF33hFDDvwxEooDtXbZ7mGTJQfmSs8aD77ThuYDsfNrgBAbHr9Yx8FrPaukMLHpxFUyyvBuzAJBMpd4a2xFxr6qts',
    xPub: 'xpub661MyMwAqRbcFDSR3frFQBdymFmSMhXeb7TCMWAt1dweeFCH7kRN1WE257E65MufrqngaLK46ERg5LHHouHiS8DvHKovmo5VhjLs5vgwqdp'
  },
  bob: {
    xPriv: 'xprv9s21ZrQH143K3DkTDsWwvUb3pwgKoYGp9hxYe2coqZz3pvE1kQfe1dQLdcN82XSeLmw1nGpMZLnXZktf9hFJTu9NRLBpQnGHwYpo4SmszZY',
    xPub: 'xpub661MyMwAqRbcFhpvKu3xHcXnNyWpCzzfWvt9SR2RPuX2hiZAHwytZRipUtM4qG2PPPF5pZttP3grZM9N9MR5jSek7RRgyggsLJAWFJJUAko'
  }
};

const clients = {
  alice: new SpvWalletClient(CONFIG.server, { xPriv: CREDENTIALS.alice.xPriv }),
  bob: new SpvWalletClient(CONFIG.server, { xPriv: CREDENTIALS.bob.xPriv }),
  admin: new SpvWalletClient(CONFIG.server, { adminKey: exampleAdminKey })
};

const getPaymail = (name: string) => `${name}@${CONFIG.paymailDomain}`;
const logSecureMessage = (from: string, to: string, totp: string) => {
  console.log(`\n!!! SECURE COMMUNICATION REQUIRED !!!\n${from}'s TOTP code for ${to}:`);
  console.log('TOTP code:', totp);
  console.log('Share using: encrypted message, secure email, phone call or in-person meeting.\n');
};

async function setupUsers() {
  console.log('0. Setting up users (optional - uncomment if users are not registered)');

  await clients.admin.AdminNewXpub(CREDENTIALS.alice.xPub, {});
  await clients.admin.AdminCreatePaymail(CREDENTIALS.alice.xPub, getPaymail('alice'), 'Alice', '', {});

  await clients.admin.AdminNewXpub(CREDENTIALS.bob.xPub, {});
  await clients.admin.AdminCreatePaymail(CREDENTIALS.bob.xPub, getPaymail('bob'), 'Bob', '', {});
}

async function verificationFlow() {
  console.log('1. Creating initial contacts');
  await clients.alice.UpsertContact(getPaymail('bob'), 'Bob Smith', getPaymail('alice'), {});
  await clients.bob.UpsertContact(getPaymail('alice'), 'Alice Smith', getPaymail('bob'), {});

  console.log('\n2. Alice initiates verification');
  const bobContact = await clients.alice.GetContactByPaymail(getPaymail('bob'));
  const aliceTotpForBob = clients.alice.GenerateTotpForContact(bobContact, CONFIG.TOTP_PERIOD, CONFIG.TOTP_DIGITS);
  logSecureMessage('Alice', 'Bob', aliceTotpForBob);

  console.log('3. Bob validates Alice\'s TOTP');
  const aliceContact = await clients.bob.GetContactByPaymail(getPaymail('alice'));
  const bobValidatedAlicesTotp = clients.bob.ValidateTotpForContact(
    aliceContact,
    aliceTotpForBob,
    bobContact.paymail,
    CONFIG.TOTP_PERIOD,
    CONFIG.TOTP_DIGITS
  );
  console.log('Validation status:', bobValidatedAlicesTotp);

  console.log('\n4. Bob initiates verification');
  const bobTotpForAlice = clients.bob.GenerateTotpForContact(
    aliceContact,
    CONFIG.TOTP_PERIOD,
    CONFIG.TOTP_DIGITS
  );
  logSecureMessage('Bob', 'Alice', bobTotpForAlice);

  console.log('5. Alice validates Bob\'s TOTP');
  const aliceValidatedBobsTotp = clients.alice.ValidateTotpForContact(
    bobContact,
    bobTotpForAlice,
    aliceContact.paymail,
    CONFIG.TOTP_PERIOD,
    CONFIG.TOTP_DIGITS
  );
  console.log('Validation status:', aliceValidatedBobsTotp);

  return { bobValidatedAlicesTotp, aliceValidatedBobsTotp };
}

async function finalizeAndCleanup(results: VerificationResults) {
  const isFullyVerified = results.bobValidatedAlicesTotp && results.aliceValidatedBobsTotp;
  console.log('\nBidirectional verification complete:', isFullyVerified);

  if (isFullyVerified) {
    console.log('\n6. Admin confirms verified contacts');
    await clients.admin.AdminConfirmContacts(getPaymail('alice'), getPaymail('bob'));

    console.log('\n7. Cleaning up contacts');
    await clients.alice.RemoveContact(getPaymail('bob'));
    await clients.bob.RemoveContact(getPaymail('alice'));
  }
}

async function main() {
  try {
    console.log('We assume that the users: Alice and Bob are already registered.\n');
    console.log("If they're not, please uncomment the setupUsers() call below.");
    // await setupUsers();
    const verificationResults = await verificationFlow();
    await finalizeAndCleanup(verificationResults);
  } catch (error) {
    console.error('Error during execution:', error);
  }
}

main();

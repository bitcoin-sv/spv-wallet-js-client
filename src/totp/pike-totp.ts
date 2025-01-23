import { HD, PublicKey, TOTP, TOTPOptions, Utils } from '@bsv/sdk';
import { Contact } from '../types';

export const DEFAULT_TOTP_PERIOD = 30;
export const DEFAULT_TOTP_DIGITS = 2;

/*
Basic flow:
Alice generates passcodeForBob with (sharedSecret+(contact.Paymail as bobPaymail))
Alice sends passcodeForBob to Bob (e.g. via email)
Bob validates passcodeForBob with (sharedSecret+(requesterPaymail as bobPaymail))
The (sharedSecret+paymail) is a "directedSecret". This ensures that passcodeForBob-from-Alice != passcodeForAlice-from-Bob.
The flow looks the same for Bob generating passcodeForAlice.
*/

/**
 * Generates a TOTP for a given contact
 *
 * @param clientXPriv - The client xpriv
 * @param contact - The Contact
 * @param period - The TOTP period (default: 30)
 * @param digits - The number of TOTP digits (default: 2)
 * @returns The generated TOTP as a string
 */
export const generateTotpForContact = (
  clientXPriv: HD,
  contact: Contact,
  period: number = DEFAULT_TOTP_PERIOD,
  digits: number = DEFAULT_TOTP_DIGITS,
): string => {
  const sharedSecret = makeSharedSecret(contact, clientXPriv);
  let secret = directedSecret(sharedSecret, contact.paymail);

  return TOTP.generate(secret, getTotpOps(period, digits));
};

/**
 * Validates a TOTP for a given contact
 *
 * @param clientXPriv - The client xpriv
 * @param generatorContact - The Contact of the person who generated the TOTP
 * @param passcode - The TOTP passcode to validate
 * @param validatorPaymail - The paymail of the person who is validating the TOTP
 * @param period - The TOTP period (default: 30)
 * @param digits - The number of TOTP digits (default: 2)
 * @returns A boolean indicating whether the TOTP is valid
 */
export const validateTotpForContact = (
  clientXPriv: HD,
  generatorContact: Contact,
  passcode: string,
  validatorPaymail: string,
  period: number = DEFAULT_TOTP_PERIOD,
  digits: number = DEFAULT_TOTP_DIGITS,
): boolean => {
  const sharedSecret = makeSharedSecret(generatorContact, clientXPriv);
  const secret = directedSecret(sharedSecret, validatorPaymail);

  return TOTP.validate(secret, passcode, getTotpOps(period, digits));
};

const getTotpOps = (period: number, digits: number): TOTPOptions => ({
  digits,
  period,
  algorithm: 'SHA-1',
});

const makeSharedSecret = (contact: Contact, clientXPriv: HD) => {
  const xprivKey = new HD().fromString(clientXPriv.toString());

  const pubKey = PublicKey.fromString(contact.pubKey);

  // PKI derivation path: m/0/0/0
  // NOTICE: we currently do not support PKI rotation; however, adjustments will be made if and when we decide to implement it
  const hd = xprivKey.derive('m/0/0/0');
  const privKey = hd.privKey;
  const ss = privKey.deriveSharedSecret(pubKey);
  return ss.getX().toHex(32);
};

const directedSecret = (sharedSecret: string, paymail: string): number[] => {
  const sharedSecretDigest = Utils.toArray(sharedSecret, 'hex') as number[];
  const paymailDigest = Utils.toArray(paymail, 'utf8') as number[];
  const concatenated = [...sharedSecretDigest, ...paymailDigest];
  return concatenated;
};

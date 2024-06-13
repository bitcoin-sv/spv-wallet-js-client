import { HD, PublicKey } from '@bsv/sdk';
import { Contact } from '../types';
import { base32 } from '@scure/base';
import { TOTP, TOTPOptions } from './totpengine';

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
export const generateTotpForContact = async (
  clientXPriv: HD,
  contact: Contact,
  period: number = DEFAULT_TOTP_PERIOD,
  digits: number = DEFAULT_TOTP_DIGITS,
): Promise<string> => {
  const sharedSecret: string = makeSharedSecret(contact, clientXPriv);
  let secret = directedSecret(sharedSecret, contact.paymail);

  const { otp } = await TOTP.generate(secret, getTotpOps(period, digits));
  return otp;
};

/**
 * Validates a TOTP for a given contact
 *
 * @param clientXPriv - The client xpriv
 * @param contact - The Contact
 * @param passcode - The TOTP passcode to validate
 * @param requesterPaymail - The paymail of the requester
 * @param period - The TOTP period (default: 30)
 * @param digits - The number of TOTP digits (default: 2)
 * @returns A boolean indicating whether the TOTP is valid
 */
export const validateTotpForContact = async (
  clientXPriv: HD,
  contact: Contact,
  passcode: string,
  requesterPaymail: string,
  period: number = DEFAULT_TOTP_PERIOD,
  digits: number = DEFAULT_TOTP_DIGITS,
): Promise<boolean> => {
  const sharedSecret: string = makeSharedSecret(contact, clientXPriv);
  const secret = directedSecret(sharedSecret, requesterPaymail);

  const { otp } = await TOTP.generate(secret, getTotpOps(period, digits));
  return otp === passcode; //TODO: check if it can be done like this
};

const getTotpOps = (period: number, digits: number): TOTPOptions => ({ digits, period, encoding: 'hex' });

const makeSharedSecret = (contact: Contact, clientXPriv: HD) => {
  const xprivKey = new HD().fromString(clientXPriv.toString());

  const pubKey = PublicKey.fromString(contact.pubKey);

  let hd = xprivKey.derive('m/0/0/0');
  let privKey = hd.privKey;
  const ss = privKey.deriveSharedSecret(pubKey);
  return ss.getX().toHex(32);
};

const directedSecret = (sharedSecret: string, paymail: string): string => {
  const paymailEncoded = new TextEncoder().encode(paymail);
  const sharedSecretEncoded = hexToUint8Array(sharedSecret);

  // Concatenate sharedSecretEncoded and paymailEncoded
  const concatenated = new Uint8Array(sharedSecretEncoded.length + paymailEncoded.length);
  concatenated.set(sharedSecretEncoded, 0);
  concatenated.set(paymailEncoded, sharedSecretEncoded.length);

  return base32.encode(concatenated);
};

const hexToUint8Array = (hex: string): Uint8Array => {
  const length = hex.length / 2;
  const uintArray = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uintArray[i] = parseInt(hex.substring(2 * i, 2 * i + 2), 16);
  }
  return uintArray;
};

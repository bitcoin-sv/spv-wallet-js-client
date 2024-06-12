import { HD, PublicKey } from '@bsv/sdk';
import { Contact } from '../types';
import { SpvWalletClient } from '../client';
import { base32 } from '@scure/base';

import { totp } from 'otplib';

export const DEFAULT_TOTP_PERIOD = 30;
export const DEFAULT_TOTP_DIGITS = 2;

/**
 * Generates a TOTP for a given contact
 *
 * @param client - The SpvWalletClient
 * @param contact - The Contact
 * @param period - The TOTP period (default: 30)
 * @param digits - The number of TOTP digits (default: 2)
 * @returns The generated TOTP as a string
 */
export const GenerateTotpForContact = (
  client: SpvWalletClient,
  contact: Contact,
  period: number = DEFAULT_TOTP_PERIOD,
  digits: number = DEFAULT_TOTP_DIGITS,
): string => {
  const sharedSecret: string = makeSharedSecret(contact, client);

  totp.options = { digits: digits, step: period, epoch: Date.now() };

  let secret = directedSecret(sharedSecret, contact.paymail);

  const totpInstance = totp.clone();
  totpInstance.options = { digits: digits, step: period };
  return totpInstance.generate(secret);
};

/**
 * Validates a TOTP for a given contact
 *
 * @param client - The SpvWalletClient
 * @param contact - The Contact
 * @param passcode - The TOTP passcode to validate
 * @param requesterPaymail - The paymail of the requester
 * @param period - The TOTP period (default: 30)
 * @param digits - The number of TOTP digits (default: 2)
 * @returns A boolean indicating whether the TOTP is valid
 */
export const ValidateTotpForContact = (
  client: SpvWalletClient,
  contact: Contact,
  passcode: string,
  requesterPaymail: string,
  period: number = DEFAULT_TOTP_PERIOD,
  digits: number = DEFAULT_TOTP_DIGITS,
) => {
  const sharedSecret: string = makeSharedSecret(contact, client);

  totp.options = { digits: digits, step: period, epoch: Date.now() };

  const secret = directedSecret(sharedSecret, requesterPaymail);
  return totp.check(passcode, secret);
};

/**
 * Creates a shared secret for a contact and client
 *
 * @param contact - The Contact
 * @param client - The SpvWalletClient
 * @returns The shared secret as a string
 */
export const makeSharedSecret = (contact: Contact, client: SpvWalletClient) => {
  if (!client.xPrivKey) {
    throw new Error("Client's xPrivKey is not defined");
  }

  const xprivKey = new HD().fromString(client.xPrivKey?.toString());

  const pubKey = PublicKey.fromString(contact.pubKey);

  let hd = xprivKey.derive('m/0/0/0');
  let privKey = hd.privKey;
  const ss = privKey.deriveSharedSecret(pubKey);
  return ss.getX().toHex(32);
};

/**
 * Creates a directed secret for a shared secret and paymail
 *
 * @param sharedSecret - The shared secret
 * @param paymail - The paymail
 * @returns The directed secret as a string
 */
export const directedSecret = (sharedSecret: string, paymail: string): string => {
  // Encode paymail to a Uint8Array in UTF-8
  const paymailEncoded = new TextEncoder().encode(paymail);

  // Encode sharedSecret to a Uint8Array
  const sharedSecretEncoded = new TextEncoder().encode(sharedSecret);

  // Concatenate sharedSecretEncoded and paymailEncoded
  const concatenated = new Uint8Array(sharedSecretEncoded.length + paymailEncoded.length);
  concatenated.set(sharedSecretEncoded, 0);
  concatenated.set(paymailEncoded, sharedSecretEncoded.length);

  return base32.encode(concatenated);
};

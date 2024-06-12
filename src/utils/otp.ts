import { CreateDigest, HashAlgorithms, HexString, TOTP, TOTPOptions, totpOptions } from '@otplib/core';
import { SHA1HMAC } from './sha1hmac';

export const createDigest: CreateDigest = (
  algorithm: HashAlgorithms,
  hmacKey: HexString,
  counter: HexString,
): HexString => {
  if (algorithm !== HashAlgorithms.SHA1) {
    throw new Error(`Algorithm ${algorithm} is not supported`);
  }

  const hmac = new SHA1HMAC(hmacKey).update(counter, 'hex');
  return hmac.digestHex();
};

export const makeTOTP = (options: Partial<TOTPOptions> = {}) => {
  return new TOTP<TOTPOptions>({
    ...options,
    createDigest,
    algorithm: HashAlgorithms.SHA1, //only SHA1 is supported for now
  });
};

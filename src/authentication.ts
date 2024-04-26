import { HD, PrivateKey } from '@bsv/sdk';

import { RandomHex, ToHash } from './utils';
import { deriveHDChildKeyFromHex } from './utils/keys';
import { signMessage } from './utils/sign';

export interface AuthPayload {
  AuthHash?: string;
  AuthNonce?: string;
  AuthTime?: number;
  BodyContents?: string;
  Signature?: string;
  xPub?: string;
  accessKey?: string;
}

// AuthHeader is the header to use for authentication (raw xPub)
export const AuthHeader = 'x-auth-xpub';

// AuthAccessKey is the header to use for access key authentication (access public key)
export const AuthAccessKey = 'x-auth-key';

// AuthSignature is the given signature (body + timestamp)
export const AuthSignature = 'x-auth-signature';

// AuthHeaderHash hash of the body coming from the request
export const AuthHeaderHash = 'x-auth-hash';

// AuthHeaderNonce random nonce for the request
export const AuthHeaderNonce = 'x-auth-nonce';

// AuthHeaderTime the time of the request, only valid for 30 seconds
export const AuthHeaderTime = 'x-auth-time';

export const setSignature = function (
  headers: { [key: string]: string },
  signingKey: HD | PrivateKey,
  bodyString: string,
): { [key: string]: string } {
  // Create the signature
  const authData = createSignature(signingKey, bodyString);

  // Set the auth header
  if (authData.xPub) {
    headers[AuthHeader] = authData.xPub;
  } else if (authData.accessKey) {
    headers[AuthAccessKey] = authData.accessKey;
  }

  return setSignatureHeaders(headers, authData);
};

const setSignatureHeaders = function (
  headers: { [key: string]: string },
  authData: AuthPayload,
): { [key: string]: string } {
  // Create the auth header hash
  if (authData.AuthHash) {
    headers[AuthHeaderHash] = authData.AuthHash;
  }

  // Set the nonce
  if (authData.AuthNonce) {
    headers[AuthHeaderNonce] = authData.AuthNonce;
  }

  // Set the time
  if (authData.AuthTime) {
    headers[AuthHeaderTime] = authData.AuthTime.toString();
  }

  // Set the signature
  if (authData.Signature) {
    headers[AuthSignature] = authData.Signature;
  }

  return headers;
};

export const createSignature = function (signingKey: HD | PrivateKey, bodyString: string) {
  const payload: AuthPayload = {};
  // x-auth-nonce is a random unique string to seed the signing message
  // this can be checked server side to make sure the request is not being replayed
  payload.AuthNonce = RandomHex(32);

  let privateKey: PrivateKey;

  if (isHDWallet(signingKey)) {
    // Get the xPub
    payload.xPub = signingKey.toPublic().toString();
    payload.accessKey = undefined;

    // Derive the address for signing
    const hdWallet: HD = deriveHDChildKeyFromHex(signingKey, payload.AuthNonce);
    privateKey = hdWallet.privKey;
  } else {
    privateKey = signingKey;
    payload.xPub = undefined;
    payload.accessKey = privateKey.toPublicKey().toString();
  }

  return createSignatureCommon(payload, bodyString, privateKey);
};

const createSignatureCommon = function (
  payload: AuthPayload,
  bodyString: string,
  privateKey: PrivateKey,
): AuthPayload {
  // Create the auth header hash
  payload.AuthHash = ToHash(bodyString);

  // x-auth-time is the current time and makes sure a request can not be sent after 30 secs
  payload.AuthTime = +new Date();

  let key = payload.xPub;
  if (!key && payload.accessKey) {
    key = payload.accessKey;
  }

  // Signature, using bitcoin signMessage
  const message = getSigningMessage(key || '', payload);
  payload.Signature = signMessage(message, privateKey);

  return payload;
};

// getSigningMessage will build the signing message string
export const getSigningMessage = function (xPub: string, auth: AuthPayload): string {
  return `${xPub}${auth.AuthHash}${auth.AuthNonce}${auth.AuthTime}`;
};

const isHDWallet = (key: HD | PrivateKey): key is HD => {
  return key != null && key instanceof HD;
}

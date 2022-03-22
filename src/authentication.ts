import bsv from 'bsv';

import { RandomHex, Hash } from "./utils";
import { deriveHDPrivateChildKeyFromHex } from "./utils/keys";
import { signMessage } from "./utils/sign";

export interface AuthPayload {
  AuthHash?:     string;
  AuthNonce?:    string;
  AuthTime?:     number;
  BodyContents?: string;
  Signature?:    string;
  xPub?:         string;
  accessKey?:    string;
}

// AuthHeader is the header to use for authentication (raw xPub)
export const AuthHeader = "auth_xpub";

// AuthAccessKey is the header to use for access key authentication (access public key)
export const AuthAccessKey = "auth_key";

// AuthSignature is the given signature (body + timestamp)
export const AuthSignature = "auth_signature";

// AuthHeaderHash hash of the body coming from the request
export const AuthHeaderHash = "auth_hash";

// AuthHeaderNonce random nonce for the request
export const AuthHeaderNonce = "auth_nonce";

// AuthHeaderTime the time of the request, only valid for 30 seconds
export const AuthHeaderTime = "auth_time";

// AuthSignatureTTL is the max TTL for a signature to be valid
export const AuthSignatureTTL = 20;

export const setSignature = function(headers: { [key: string]: string }, signingKey: bsv.HDPrivateKey | bsv.PrivateKey, bodyString: string): { [key: string]: string } {

  // Create the signature
  const authData = createSignature(signingKey, bodyString)

  // Set the auth header
  if (authData.xPub) {
    headers[AuthHeader] = authData.xPub;
  } else if (authData.accessKey) {
    headers[AuthAccessKey] = authData.accessKey;
  }

  return setSignatureHeaders(headers, authData)
}

const setSignatureHeaders = function(headers: { [key: string]: string }, authData: AuthPayload): { [key: string]: string } {

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
}

export const createSignature = function(signingKey: bsv.HDPrivateKey | bsv.PrivateKey, bodyString: string) {

  // No key?
  if (!signingKey) {
    throw new Error("missing signingKey key")
  }

  const payload: AuthPayload = {};
  // auth_nonce is a random unique string to seed the signing message
  // this can be checked server side to make sure the request is not being replayed
  payload.AuthNonce = RandomHex(32)

  let privateKey: bsv.PrivateKey;
  // @ts-ignore
  if (signingKey.hdPublicKey) {
    const hdKey = signingKey as bsv.HDPrivateKey;
    // Get the xPub
    payload.xPub = hdKey.hdPublicKey.toString(); // will throw
    payload.accessKey = undefined;

    // Derive the address for signing
    const key: bsv.HDPrivateKey = deriveHDPrivateChildKeyFromHex(hdKey, payload.AuthNonce);
    privateKey = key.privateKey;
  } else {
    privateKey = signingKey as bsv.PrivateKey;
    payload.xPub = undefined;
    payload.accessKey = privateKey.publicKey.toString();
  }

  return createSignatureCommon(payload, bodyString, privateKey)
}

const createSignatureCommon = function(payload: AuthPayload, bodyString: string, privateKey: bsv.PrivateKey): AuthPayload {

  // Create the auth header hash
  payload.AuthHash = Hash(bodyString)

  // auth_time is the current time and makes sure a request can not be sent after 30 secs
  payload.AuthTime = +new Date();

  let key = payload.xPub
  if (!key && payload.accessKey) {
    key = payload.accessKey
  }

  // Signature, using bitcoin signMessage
  const message = getSigningMessage(key || "", payload);
  //payload.Signature = Message.sign(Buffer.from(message), privateKey);
  payload.Signature = signMessage(message, privateKey);

  return payload
}

// getSigningMessage will build the signing message string
export const getSigningMessage = function(xPub: string, auth: AuthPayload): string {
  return `${xPub}${auth.AuthHash}${auth.AuthNonce}${auth.AuthTime}`;
}

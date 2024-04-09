import { generateKeys } from '../dist/typescript-npm-package.cjs.js';

interface KeyPair {
  xPub: string;
  xPriv: string;
}

export function generateKeyPair(): KeyPair {
  const keys = generateKeys();
  return {
    xPub: keys.xPub.toString(),
    xPriv: keys.xPriv(),
  };
}

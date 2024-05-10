import { getChildNumsFromHex } from './index';
import { Key, KeyWithMnemonic } from '../types';
import { HD, Mnemonic } from '@bsv/sdk';

// deriveChildKeyFromHex derive the child extended key from the hex string
export const deriveChildKeyFromHex = function (hdKey: HD, hexHash: string): HD {
  return deriveHDChildKeyFromHex(hdKey, hexHash);
};

export const deriveHDChildKeyFromHex = function (hdKey: HD, hexHash: string): HD {
  let childKey: HD = hdKey;
  const childNums = getChildNumsFromHex(hexHash);
  childNums.forEach((childNum) => {
    childKey = childKey.deriveChild(childNum);
  });

  return childKey;
};

export const generateKeys = function (): KeyWithMnemonic {
  const mnemonic = Mnemonic.fromRandom();
  return getKeysFromMnemonic(mnemonic.toString());
};

export const getKeysFromMnemonic = function (mnemonicStr: string): KeyWithMnemonic {
  const mnemonic = Mnemonic.fromString(mnemonicStr);
  const seed = mnemonic.toSeed();
  const hdWallet = new HD().fromSeed(seed);

  return {
    xPriv: () => hdWallet.toString(),
    mnemonic: mnemonic.toString(),
    xPub: {
      toString() {
        return hdWallet.toPublic().toString();
      },
    },
  };
};

export const getKeysFromString = function (privateKey: string): Key {
  let hdWallet = new HD().fromString(privateKey);

  return {
    xPriv: () => hdWallet.privKey.toString(),
    xPub: {
      toString() {
        return hdWallet.toPublic().toString();
      },
    },
  };
};

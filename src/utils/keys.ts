import bsv from "bsv";
import Mnemonic from "bsv/mnemonic";
import {getChildNumsFromHex} from "./index";

import {
  Key,
  KeyWithMnemonic,
} from "../interface";

// deriveChildKeyFromHex derive the child extended key from the hex string
export const deriveChildKeyFromHex = function (hdKey: bsv.HDPrivateKey | bsv.HDPublicKey, hexHash: string): bsv.HDPrivateKey | bsv.HDPublicKey {
  if (hdKey instanceof bsv.HDPrivateKey) {
    return deriveHDPrivateChildKeyFromHex(hdKey, hexHash);
  } else {
    return deriveHDPublicChildKeyFromHex(hdKey, hexHash);
  }
}

export const deriveHDPrivateChildKeyFromHex = function (hdKey: bsv.HDPrivateKey, hexHash: string): bsv.HDPrivateKey {
  let childKey: bsv.HDPrivateKey = hdKey;
  const childNums = getChildNumsFromHex(hexHash);

  childNums.forEach(childNum => {
    childKey = childKey.deriveChild(childNum, false);
  });

  return childKey;
}

export const deriveHDPublicChildKeyFromHex = function (hdKey: bsv.HDPublicKey, hexHash: string): bsv.HDPublicKey {
  let childKey: bsv.HDPublicKey = hdKey;
  const childNums = getChildNumsFromHex(hexHash);

  childNums.forEach(childNum => {
    childKey = childKey.deriveChild(childNum, false);
  });

  return childKey;
}

export const generateNewKeys = function() : KeyWithMnemonic {
  bsv.HDPrivateKey.fromRandom()
  const mnemonic = Mnemonic.fromRandom()
  return generateKeysFromMnemonic(mnemonic.toString())
}

export const generateKeysFromMnemonic = function(mnemonicStr: string) : KeyWithMnemonic {
  const mnemonic = Mnemonic.fromString(mnemonicStr)
  const seed = mnemonic.toSeed()
  const hdPrivateKey = bsv.HDPrivateKey.fromSeed(seed, bsv.Networks.mainnet)

  return {
    toString: () => hdPrivateKey.toString(),
    mnemonic: mnemonic.toString(),
    xPub: {
        toString() {
          return hdPrivateKey.hdPublicKey.toString()
      }
    }
  }
}

export const generateKeysFromString = function(privateKey: string) : Key {
  let hdPrivateKey = bsv.HDPrivateKey.fromString(privateKey)

  return {
    toString: () => hdPrivateKey.toString(),
    xPub: {
      toString() {
        return hdPrivateKey.hdPublicKey.toString()
      }
    }
  }
}

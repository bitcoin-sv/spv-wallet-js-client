import bsv from "bsv";
import {getChildNumsFromHex} from "./index";

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

export const generateSetOfKeys = function(): {hdPrivateKey:  bsv.HDPrivateKey, hdPublicKey:  bsv.HDPublicKey} {
  const privateKey = bsv.HDPrivateKey.fromRandom()

  return {
    hdPrivateKey: privateKey,
    hdPublicKey: privateKey.hdPublicKey,
  }
}

export const getPublicKeyFromHDPrivateKey = function(privateKey: string): bsv.HDPublicKey {
  const hdPrivateKey = bsv.HDPrivateKey.fromString(privateKey);

  return hdPrivateKey.hdPublicKey;
}

import bsv from 'bsv'
import Mnemonic from 'bsv/mnemonic'
import { getChildNumsFromHex } from './index'

import { Key, KeyWithMnemonic } from '../interface'

// deriveChildKeyFromHex derive the child extended key from the hex string
export const deriveChildKeyFromHex = function (
  hdKey: bsv.HDPrivateKey | bsv.HDPublicKey,
  hexHash: string
): bsv.HDPrivateKey | bsv.HDPublicKey {
  if (hdKey instanceof bsv.HDPrivateKey) {
    return deriveHDPrivateChildKeyFromHex(hdKey as bsv.HDPrivateKey, hexHash)
  } else {
    return deriveHDPublicChildKeyFromHex(hdKey, hexHash)
  }
}

export const deriveHDPrivateChildKeyFromHex = function (hdKey: bsv.HDPrivateKey, hexHash: string): bsv.HDPrivateKey {
  let childKey: bsv.HDPrivateKey = hdKey
  const childNums = getChildNumsFromHex(hexHash)

  childNums.forEach((childNum) => {
    childKey = childKey.deriveChild(childNum, false)
  })

  return childKey
}

export const deriveHDPublicChildKeyFromHex = function (hdKey: bsv.HDPublicKey, hexHash: string): bsv.HDPublicKey {
  let childKey: bsv.HDPublicKey = hdKey
  const childNums = getChildNumsFromHex(hexHash)

  childNums.forEach((childNum) => {
    childKey = childKey.deriveChild(childNum, false)
  })

  return childKey
}

export const generateKeys = function (): KeyWithMnemonic {
  bsv.HDPrivateKey.fromRandom()
  const mnemonic = Mnemonic.fromRandom()
  return getKeysFromMnemonic(mnemonic.toString())
}

export const getKeysFromMnemonic = function (mnemonicStr: string): KeyWithMnemonic {
  const mnemonic = Mnemonic.fromString(mnemonicStr)
  const seed = mnemonic.toSeed()
  const hdPrivateKey = bsv.HDPrivateKey.fromSeed(seed, bsv.Networks.mainnet)

  return {
    xPriv: () => hdPrivateKey.toString(),
    mnemonic: mnemonic.toString(),
    xPub: {
      toString() {
        return hdPrivateKey.hdPublicKey.toString()
      },
    },
  }
}

export const getKeysFromString = function (privateKey: string): Key {
  let hdPrivateKey = bsv.HDPrivateKey.fromString(privateKey)

  return {
    xPriv: () => hdPrivateKey.toString(),
    xPub: {
      toString() {
        return hdPrivateKey.hdPublicKey.toString()
      },
    },
  }
}

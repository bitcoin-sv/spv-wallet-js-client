import bsv from 'bsv'

export const isHDPrivateKey = (key: bsv.HDPrivateKey | bsv.PrivateKey): key is bsv.HDPrivateKey => {
  return key != null && (key as bsv.HDPrivateKey).hdPublicKey !== undefined
}

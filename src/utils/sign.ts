import bsv from 'bsv';

// all take from the bsv/message lib

const MAGIC_BYTES = Buffer.from('Bitcoin Signed Message:\n');

const magicHash = function magicHash(message: string) {
  const messageBuffer = Buffer.from(message);

  // @ts-ignore
  const prefix1 = bsv.encoding.BufferWriter.varintBufNum(MAGIC_BYTES.length);
  // @ts-ignore
  const prefix2 = bsv.encoding.BufferWriter.varintBufNum(messageBuffer.length);
  const buf = Buffer.concat([prefix1, MAGIC_BYTES, prefix2, messageBuffer]);

  return bsv.crypto.Hash.sha256sha256(buf);
};

export const signMessage = function (message: string, privateKey: bsv.PrivateKey): string {
  const hash = magicHash(message);
  // @ts-ignore
  const signature = bsv.crypto.ECDSA.signWithCalcI(hash, privateKey);

  return signature.toCompact().toString('base64');
};

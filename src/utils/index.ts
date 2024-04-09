import bsv from 'bsv';
import { ErrorWrongHex } from '../errors';

const maxInt32 = 2147483648 - 1; // 0x80000000

// RandomHex returns a random hex string and error
export const RandomHex = function (n: number): string {
  const randomBuffer = bsv.crypto.Random.getRandomBuffer(n);
  return randomBuffer.toString('hex');
};

// Hash returns a sha256 hash of the string
export const Hash = function (string: string): string {
  return bsv.crypto.Hash.sha256(Buffer.from(string)).toString('hex');
};

// isHex returns whether the given hex string a valid hex string is
export const isHex = function (hexString: string): boolean {
  return !!hexString.match(/^[0-9a-f]*$/i);
};

// getChildNumsFromHex get an array of numbers from the hex string
export const getChildNumsFromHex = function (hexHash: string): number[] {
  if (!isHex(hexHash)) {
    throw new ErrorWrongHex(hexHash);
  }

  const strLen = hexHash.length;
  const size = 8;
  const splitLength = Math.ceil(strLen / size);
  const childNums: number[] = [];
  for (let i = 0; i < splitLength; i++) {
    const start = i * size;
    let stop = start + size;
    if (stop > strLen) {
      stop = strLen;
    }
    let num = Number('0x' + hexHash.substring(start, stop));
    if (num > maxInt32) {
      num = num - maxInt32;
    }
    childNums.push(num);
  }

  return childNums;
};

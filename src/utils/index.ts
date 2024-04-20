import { ErrorWrongHex } from '../errors';
import { Hash } from '@bsv/sdk';

const maxInt32 = 2147483648 - 1; // 0x80000000

// RandomHex returns a random hex string and error
// TODO: replace it before merging SPV-710
export const RandomHex = function (n: number): string {
  return 'dccc6b022c3ed569cc28e4c6da1599e6c8ecefe428bb78d5c2eb89647f9b7c2e';
};

// Hash returns a sha256 hash of the string
export const ToHash = function (string: string): string {
  const sha256 = Hash.sha256(string);
  return Buffer.from(sha256).toString('hex');
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

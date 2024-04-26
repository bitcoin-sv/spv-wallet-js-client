import { describe, expect, test } from '@jest/globals';
import { getChildNumsFromHex, ToHash } from './index';
import { ErrorWrongHex } from '../errors';

const messageToHash: string = '{"conditions":{},"metadata":{},"params":{}}';
const testHash = '8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414';

describe('getChildNumsFromHex', () => {
  test('empty hex', () => {
    const childNums = getChildNumsFromHex('');
    expect(childNums).toStrictEqual([]);
  });

  test('empty hex', () => {
    expect(() => {
      getChildNumsFromHex('test');
    }).toThrow(ErrorWrongHex);
  });

  test('hex ababab', () => {
    const childNums = getChildNumsFromHex('ababab');
    expect(childNums).toStrictEqual([11250603]);
  });

  test('hex testHash', () => {
    const childNums = getChildNumsFromHex(testHash);
    expect(childNums).toStrictEqual([
      196136815, // 8bb0cf6e = 2343620462 - 2147483647
      967933200, // b9b17d0f = 3115416847 - 2147483647
      2099426390, // 7d22b456
      1897997694, // f121257d = 4045481341 - 2147483647
      1092963872, // c1254e1f = 3240447519 - 2147483647
      23483248, // 01665370
      1197704170, // 476383ea
      2003694612, // 776df414
    ]);
  });
});

describe('ToHash', () => {
  test('proper hash operation', () => {
    const hash = ToHash(messageToHash);
    expect(hash).toBe("aa655e1817379f75800937db8980faa3ee3514056e424d22b60283e4ef284ca3");
  })
});

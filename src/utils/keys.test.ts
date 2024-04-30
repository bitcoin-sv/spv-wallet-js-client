import { describe, test } from '@jest/globals';
import { deriveChildKeyFromHex, generateKeys } from './keys';
import { HD } from '@bsv/sdk';

const testHash = '8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414';
const testXpriv =
  'xprv9s21ZrQH143K3N6qVJQAu4EP51qMcyrKYJLkLgmYXgz58xmVxVLSsbx2DfJUtjcnXK8NdvkHMKfmmg5AJT2nqqRWUrjSHX29qEJwBgBPkJQ';
const testXpub =
  'xpub661MyMwAqRbcFrBJbKwBGCB7d3fr2SaAuXGM95BA62X41m6eW2ehRQGW4xLi9wkEXUGnQZYxVVj4PxXnyrLk7jdqvBAs1Qq9gf6ykMvjR7J';
const derivedXpriv =
  'xprvA8mj2ZL1w6Nqpi6D2amJLo4Gxy24tW9uv82nQKmamT2rkg5DgjzJZRFnW33e7QJwn65uUWSuN6YQyWrujNjZdVShPRnpNUSRVTru4cxaqfd';
const derivedXpub =
  'xpub6Mm5S4rumTw93CAg8cJJhw11WzrZHxsmHLxPCiBCKnZqdUQNEHJZ7DaGMKucRzXPHtoS2ZqsVSRjxVbibEvwmR2wXkZDd8RrTftmm42cRsf';

describe('deriveChildKeyFromHex', () => {
  test('xpriv', () => {
    const key = new HD().fromString(testXpriv);
    const childKey = deriveChildKeyFromHex(key, testHash);
    expect(childKey.toString()).toEqual(derivedXpriv);
  });

  test('xpub', () => {
    const key = new HD().fromString(testXpub);
    const childKey = deriveChildKeyFromHex(key, testHash);
    expect(childKey.toString()).toEqual(derivedXpub);
  });

  test('xpriv => xpub', () => {
    const key = new HD().fromString(testXpriv);
    const childKey = deriveChildKeyFromHex(key, testHash);

    const pubKey = new HD().fromString(childKey.toString()).toPublic().toString();
    expect(pubKey).toEqual(derivedXpub);
  });
});

describe('generateKeys', () => {
  test('keys are base58', () => {
    const keys = generateKeys();
    expect(keys.xPriv()).toMatch(/^xprv/);
    expect(keys.xPub.toString()).toMatch(/^xpub/);
  });
});

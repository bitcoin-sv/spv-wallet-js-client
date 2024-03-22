import bsv from 'bsv'
import { describe, test } from '@jest/globals'
import { deriveChildKeyFromHex } from './keys'

const testHash = '8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414'
const testXpriv =
  'xprv9s21ZrQH143K3N6qVJQAu4EP51qMcyrKYJLkLgmYXgz58xmVxVLSsbx2DfJUtjcnXK8NdvkHMKfmmg5AJT2nqqRWUrjSHX29qEJwBgBPkJQ'
const testXpub =
  'xpub661MyMwAqRbcFrBJbKwBGCB7d3fr2SaAuXGM95BA62X41m6eW2ehRQGW4xLi9wkEXUGnQZYxVVj4PxXnyrLk7jdqvBAs1Qq9gf6ykMvjR7J'
const derivedXpriv =
  'xprvA8mj2ZL1w6Nqpi6D2amJLo4Gxy24tW9uv82nQKmamT2rkg5DgjzJZRFnW33e7QJwn65uUWSuN6YQyWrujNjZdVShPRnpNUSRVTru4cxaqfd'
const derivedXpub =
  'xpub6Mm5S4rumTw93CAg8cJJhw11WzrZHxsmHLxPCiBCKnZqdUQNEHJZ7DaGMKucRzXPHtoS2ZqsVSRjxVbibEvwmR2wXkZDd8RrTftmm42cRsf'

describe('deriveChildKeyFromHex', () => {
  test('xpriv', () => {
    const key = bsv.HDPrivateKey.fromString(testXpriv)
    const childKey = deriveChildKeyFromHex(key, testHash)
    expect(childKey.toString()).toEqual(derivedXpriv)
  })

  test('xpub', () => {
    const key = bsv.HDPublicKey.fromString(testXpub)
    const childKey = deriveChildKeyFromHex(key, testHash)
    expect(childKey.toString()).toEqual(derivedXpub)
  })

  test('xpriv => xpub', () => {
    const key = bsv.HDPrivateKey.fromString(testXpriv)
    const childKey = deriveChildKeyFromHex(key, testHash)

    // @ts-ignore
    const pubKey = bsv.HDPublicKey.fromHDPrivateKey(childKey).toString()
    expect(pubKey).toEqual(derivedXpub)
  })
})

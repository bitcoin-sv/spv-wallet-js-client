import { getKeysFromString } from '../dist/typescript-npm-package.cjs.js';

// This is an example xPriv key - replace it with your own
const xPriv = 'xprv9s21ZrQH143K4VneY3UWCF1o5Kk2tmgGrGtMtsrThCTsHsszEZ6H1iP37ZTwuUBvMwudG68SRkcfTjeu8h3rkayfyqkjKAStFBkuNsBnAkS';

console.log('extracted xPub:', getKeysFromString(xPriv).xPub.toString());

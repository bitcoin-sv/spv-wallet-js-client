import { getKeysFromMnemonic } from '../dist/typescript-npm-package.cjs.js';

// This is an example mnemonic phrase - replace it with your own
const mnemonicPhrase = 'nut same spike popular already mercy kit board rent light illegal local eight filter tube';

console.log('extracted xPriv:', getKeysFromMnemonic(mnemonicPhrase).xPriv());

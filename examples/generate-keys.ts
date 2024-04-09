import { generateKeys } from '../dist/typescript-npm-package.cjs.js';

const keys = generateKeys();
export const exampleXPriv = keys.xPriv();
export const exampleXPub = keys.xPub.toString();

console.log('exampleXPriv:', exampleXPriv);
console.log('exampleXPub:', exampleXPub);

import { generateKeys } from '../dist/typescript-npm-package.cjs.js';

const keys = generateKeys();
const exampleXPriv = keys.xPriv();
const exampleXPub = keys.xPub.toString();

console.log('exampleXPriv:', exampleXPriv);
console.log('exampleXPub:', exampleXPub);

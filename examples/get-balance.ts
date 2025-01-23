import { SPVWalletUserAPI } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPub } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

if (!exampleXPub) {
  console.log(errMessage('xPub'));
  process.exit(1);
}

const client = new SPVWalletUserAPI(server, {
  xPub: exampleXPub,
});

const userInfo = await client.xPub();
console.log('userInfo', userInfo);
console.log('Current balance:', userInfo.currentBalance);

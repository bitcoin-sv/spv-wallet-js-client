import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys.js';
import { errMessage } from './utils';

const server = 'http://localhost:3003/v1';

if (!exampleXPriv) {
  console.log(errMessage('xPriv'))
  process.exit(1);
}

const client = new SpvWalletClient(server, {
  xPriv: exampleXPriv,
});

const xpubInfo = await client.GetXPub();
console.log('Current balance:', xpubInfo.current_balance);

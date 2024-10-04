import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey, exampleXPriv } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

// It is possible to get paymail domains either as an admin or as a user.
if (!exampleAdminKey && !exampleXPriv) {
  console.log(errMessage('adminKey'), 'or', errMessage('xPriv'));
  process.exit(1);
}

const client = exampleXPriv
  ? new SpvWalletClient(server, { xPriv: exampleXPriv })
  : new SpvWalletClient(server, { adminKey: exampleAdminKey });

const sharedConfig = await client.GetSharedConfig();

console.log(sharedConfig.paymailDomains[0]);

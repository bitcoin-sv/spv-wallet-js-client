import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey, exampleXPub, examplePaymail } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003/v1';

if (!exampleAdminKey) {
  console.log(errMessage('adminKey'));
  process.exit(1);
}

const adminClient = new SpvWalletClient(server, {
  adminKey: exampleAdminKey,
});

const newXPubRes = await adminClient.AdminNewXpub(exampleXPub, { some_metadata: 'example' });
console.log('AdminNewXpub response:', newXPubRes);

const createPaymailRes = await adminClient.AdminCreatePaymail(exampleXPub, examplePaymail, 'Some public name', '');
console.log('AdminCreatePaymail response:', createPaymailRes);

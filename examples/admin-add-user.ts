import { SPVWalletAdminAPI } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey, exampleXPub, examplePaymail } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

if (!exampleAdminKey) {
  console.log(errMessage('adminKey'));
  process.exit(1);
}

const adminClient = new SPVWalletAdminAPI(server, {adminKey : exampleAdminKey});

const newXPubRes = await adminClient.createXPub(exampleXPub, { some_metadata: 'example' });
console.log('AdminNewXpub response:', newXPubRes);

const createPaymailRes = await adminClient.createPaymail(exampleXPub, examplePaymail, 'Some public name', '', {});
console.log('AdminCreatePaymail response:', createPaymailRes);

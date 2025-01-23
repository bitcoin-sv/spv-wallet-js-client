import { SPVWalletAdminAPI } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey, examplePaymail } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

if (!exampleAdminKey) {
  console.log(errMessage('adminKey'));
  process.exit(1);
}

const adminClient = new SPVWalletAdminAPI(server, exampleAdminKey);

await adminClient.deletePaymail(examplePaymail, examplePaymail);

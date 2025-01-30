import { SPVWalletAdminAPI } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

if (!exampleAdminKey) {
  console.log(errMessage('adminKey'));
  process.exit(1);
}

const adminClient = new SPVWalletAdminAPI(server, {adminKey : exampleAdminKey});

await adminClient.deletePaymail("d43ed481ba08aae1db02d880ebefe962f9796168387bb293a95024cb02b953ef");

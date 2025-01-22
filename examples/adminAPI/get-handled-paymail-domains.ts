import { AdminAPI } from '../../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey } from '../keys/example-keys.js';
import { errMessage } from '../utils.js';

const server = 'http://localhost:3003';

if (!exampleAdminKey) {
  console.log(errMessage('adminKey'));
  process.exit(1);
}

const client = new AdminAPI(server, exampleAdminKey);

const sharedConfig = await client.sharedConfig();

console.log(sharedConfig.paymailDomains[0]);

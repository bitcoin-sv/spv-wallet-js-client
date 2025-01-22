import { UserAPI } from '../../dist/typescript-npm-package.cjs.js';
import { exampleXPriv, exampleXPub } from '../keys/example-keys.js';
import { errMessage } from '../utils.js';

const server = 'http://localhost:3003';

if (!exampleXPriv) {
  console.log(errMessage('xPriv'));
  process.exit(1);
}

const client = new UserAPI(server, { xPriv: exampleXPriv, xPub : exampleXPub });

const sharedConfig = await client.sharedConfig();

console.log(sharedConfig.paymailDomains[0]);

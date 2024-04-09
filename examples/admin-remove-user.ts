import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey, exampleXPub, examplePaymail } from './example-keys.js';

const server = 'http://localhost:3003/v1';

const adminClient = new SpvWalletClient(server, {
  adminKey: exampleAdminKey,
});

const delPaymail = await adminClient.AdminDeletePaymail(examplePaymail);
console.log('AdminDeletePaymail response:', delPaymail);

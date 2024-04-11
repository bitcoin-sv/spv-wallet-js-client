import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey, examplePaymail } from './example-keys.js';

const server = 'http://localhost:3003/v1';

const adminClient = new SpvWalletClient(server, {
  adminKey: exampleAdminKey,
});

await adminClient.AdminDeletePaymail(examplePaymail);

import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003/api/v1';

if (!exampleXPriv) {
  console.log(errMessage('xPriv'));
  process.exit(1);
}

const client = new SpvWalletClient(server, {
  xPriv: exampleXPriv,
});

const createdAccessKey = await client.CreateAccessKey({ some_metadata: 'example' });
console.log('Created access key ID:', (createdAccessKey.id));
console.log('Metadata:', (createdAccessKey.metadata));
console.log('Created at:', (createdAccessKey.createdAt));

const fetchedAccessKey = await client.GetAccessKeyByID(createdAccessKey.id);
console.log('Fetched access key ID:', (fetchedAccessKey.id));

const revokedAccessKey = await client.RevokeAccessKey(createdAccessKey.id);
console.log('Revoked access key ID:', (revokedAccessKey.id));
console.log('Revoked at:', (revokedAccessKey.revokedAt));

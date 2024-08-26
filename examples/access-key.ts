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
console.log('Created access key ID:', JSON.stringify(createdAccessKey.id));
console.log('Metadata:', JSON.stringify(createdAccessKey.metadata));
console.log('Created at:', JSON.stringify(createdAccessKey.createdAt));

const fetchedAccessKey = await client.GetAccessKey(createdAccessKey.id);
console.log('Fetched access key ID:', JSON.stringify(fetchedAccessKey.id));

const revokedAccessKey = await client.RevokeAccessKey(createdAccessKey.id);
console.log('Revoked access key ID:', JSON.stringify(revokedAccessKey.id));
console.log('Revoked at:', JSON.stringify(revokedAccessKey.revokedAt));

import { SPVWalletUserAPI } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPub } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

if (!exampleXPub) {
  console.log(errMessage('xPub'));
  process.exit(1);
}

const client = new SPVWalletUserAPI(server, {
  xPub: exampleXPub,
});

const createdAccessKey = await client.generateAccessKey({ key: 'value' });
console.log('Created access key ID:', createdAccessKey.id);
console.log('Metadata:', createdAccessKey.metadata);
console.log('Created at:', createdAccessKey.createdAt);

const fetchedAccessKey = await client.accessKey(createdAccessKey.id);
console.log('Fetched access key ID:', fetchedAccessKey.id);

await client.revokeAccessKey(createdAccessKey.id);

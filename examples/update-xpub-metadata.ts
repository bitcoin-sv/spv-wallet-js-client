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

const userInfo = await client.GetUserInfo();
console.log('XPub metadata:', userInfo.metadata);
console.log('XPub (updated_at):', userInfo.updatedAt);

const updatedXpubInfo = await client.UpdateXPubMetadata({ some_metadata_2: 'example2' });
console.log('Updated XPub metadata:', updatedXpubInfo.metadata);
console.log('Updated XPub (updated_at):', updatedXpubInfo.updatedAt);

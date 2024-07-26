import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003/v1';

if (!exampleXPriv) {
  console.log(errMessage('xPriv'));
  process.exit(1);
}

const client = new SpvWalletClient(server, {
  xPriv: exampleXPriv,
});

const xpubInfo = await client.GetXPub();
console.log('XPub metadata:', xpubInfo.metadata);
console.log('XPub (updated_at):', xpubInfo.updated_at);

const updatedXpubInfo = await client.UpdateXPubMetadata({ some_metadata_2: 'example2' });
console.log('Updated XPub metadata:', updatedXpubInfo.metadata);
console.log('Updated XPub (updated_at):', updatedXpubInfo.updated_at);

import { SPVWalletUserAPI } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

if (!exampleXPriv) {
  console.log(errMessage('xPriv'));
  process.exit(1);
}

const client = new SPVWalletUserAPI(server, {
  
  xPriv: exampleXPriv,
});

const userInfo = await client.xPub();
console.log('User XPub metadata:', userInfo.metadata);
console.log('User XPub (updated_at):', userInfo.updatedAt);

const updatedUserInfo = await client.updateXPubMetadata({ some_metadata_2: 'example2' });
console.log('Updated User XPub metadata:', updatedUserInfo.metadata);
console.log('Updated User XPub (updated_at):', updatedUserInfo.updatedAt);

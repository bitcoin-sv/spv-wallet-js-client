import {
  ErrorResponse,
  MerkleRoot,
  MerkleRootsRepository,
  SpvWalletError,
  SPVWalletUserAPI,
} from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

// perhaps change exmapleXPub to actual existing in db
if (!exampleXPriv) {
  console.log(errMessage('xPriv'));
  process.exit(1);
}

const client = new SPVWalletUserAPI(server, {
  xPriv: exampleXPriv,
});

// simulate a storage of merkle roots that exists on a client side that is using SyncMerkleRoots method
const db: {
  merkleRoots: MerkleRoot[];
} = {
  merkleRoots: [
    {
      merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      blockHeight: 0,
    },
    {
      merkleRoot: '0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098',
      blockHeight: 1,
    },
    {
      merkleRoot: '9b0fc92260312ce44e74ef369f5c66bbb85848f2eddd5a7a1cde251e54ccfdd5',
      blockHeight: 2,
    },
  ],
};

// simulate repository
const repository: MerkleRootsRepository = {
  saveMerkleRoots: async (syncedMerkleRoots: MerkleRoot[]) => {
    console.log('\nsaveMerkleRoots called\n');
    db.merkleRoots.push(...syncedMerkleRoots);

    return Promise.resolve();
  },
  getLastMerkleRoot: async () => {
    if (db.merkleRoots.length < 1) {
      return undefined;
    }
    return db.merkleRoots[db.merkleRoots.length - 1].merkleRoot;
  },
};

const getLastFiveOrFewer = (merkleroots: MerkleRoot[]) => {
  let startIndex = merkleroots.length - 5;
  if (startIndex < 0) {
    startIndex = 0;
  }

  return merkleroots.slice(startIndex);
};

try {
  console.log('\n\nINITIAL STATE LENGTH: ', db.merkleRoots.length, '\n\n');
  console.log('\nInitial State Last 5 MerkleRoots (or fewer):\n', getLastFiveOrFewer(db.merkleRoots), '\n\n');

  await client.syncMerkleRoots(repository);

  console.log('\nAFTER SYNC', db.merkleRoots.length, '\n\n');
  console.log('\nAFTER SYNC Last 5 MerkleRoots (or fewer):\n', getLastFiveOrFewer(db.merkleRoots), '\n\n');
} catch (e) {
  if (e instanceof SpvWalletError) {
    // You can check the type of the error and do something specific
    if (e instanceof ErrorResponse) {
      console.error('Response status:', e.response.status);
      console.error('Content:', e.content);
    } else {
      //check all the other error types here: src/errors.ts
      console.error('SpvWalletError:', e.message);
    }
  } else {
    console.log('Unknown error:', e);
  }
}

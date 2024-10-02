import {
  ErrorNoAdminKey,
  ErrorResponse,
  MerkleRoot,
  Repository,
  SpvWalletClient,
  SpvWalletError,
} from '../dist/typescript-npm-package.cjs.js';
import { exampleXPub } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003/api/v1';

// perhaps change exmapleXPub to actual existing in db
if (!exampleXPub) {
  console.log(errMessage('xPub'));
  process.exit(1);
}

const client = new SpvWalletClient(server, {
  xPub: exampleXPub,
});

// simulate database
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
    {
      merkleRoot: '612209eca3ff078e55d1ffe4602e78ac9a53458c7f9196b38c232d8af9ed635d',
      blockHeight: 864550,
    },
  ],
};

// simulate repository
const repository: Repository = {
  saveMerkleRoots: (syncedMerkleRoots: MerkleRoot[]) => {
    db.merkleRoots.push(...syncedMerkleRoots);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  },
  getLastEvaluatedKey: () => {
    return new Promise((resolve) => {
      if (db.merkleRoots.length < 1) {
        resolve(undefined);
      } else {
        resolve(db.merkleRoots[db.merkleRoots.length - 1].merkleRoot);
      }
    });
  },
};

try {
  console.log('INITIAL STATE: ', db.merkleRoots, '\n\n');

  await client.SyncMerkleRoots(repository);
  console.log('INITIAL STATE: ', db.merkleRoots, '\n\n');
  console.log('AFTER SYNC', db.merkleRoots, '\n\n');
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

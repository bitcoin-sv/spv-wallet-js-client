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

const txs = await client.GetTransactions({}, {}, {});
console.log('GetTransactions response:', txs);

const txsFiltered = await client.GetTransactions(
  {
    blockHeight: 839228,
  },
  {},
  {
    page_size: 100,
    page: 1,
  },
);
console.log('Filtered GetTransactions response:', txsFiltered);

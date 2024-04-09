import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys.js';

const server = 'http://localhost:3003/v1';

const client = new SpvWalletClient(server, {
  xPriv: exampleXPriv,
});

const txs = await client.GetTransactions({}, {}, {});
console.log('GetTransactions response:', txs);

const txsFiltered = await client.GetTransactions(
  {
    block_height: 839228,
  },
  {
    some_metadata: 'example',
  },
  {
    page_size: 100,
    page: 1,
  },
);
console.log('Filtered GetTransactions response:', txsFiltered);
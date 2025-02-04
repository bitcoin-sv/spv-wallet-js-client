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

const txs = await client.transactions({}, {}, {});
console.log('GetTransactions response:', txs);

const txsFiltered = await client.transactions(
  {
    blockHeight: 839228,
  },
  {},
  {
    size: 100,
    page: 1,
  },
);
console.log('Filtered GetTransactions response:', txsFiltered);

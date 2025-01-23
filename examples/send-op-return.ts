import { DraftTransactionConfig, OpReturn, SPVWalletUserAPI } from '../dist/typescript-npm-package.cjs.js';
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

const opReturn: OpReturn = {
  stringParts: ['hello', 'world'],
};

const transactionConfig: DraftTransactionConfig = {
  outputs: [
    {
      opReturn: opReturn,
    },
  ],
};

const draftTransaction = await client.draftTransaction(transactionConfig, {});
console.log('DraftTransaction response:', draftTransaction);

const finalized = await client.finalizeTransaction(draftTransaction);
const transaction = await client.recordTransaction(finalized, draftTransaction.id, {});
console.log('Transaction with OP_RETURN:', transaction);

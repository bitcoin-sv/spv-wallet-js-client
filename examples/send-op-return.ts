import { DraftTransactionConfig, OpReturn, SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

if (!exampleXPriv) {
  console.log(errMessage('xPriv'));
  process.exit(1);
}

const client = new SpvWalletClient(server, {
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

const draftTransaction = await client.NewDraftTransaction(transactionConfig, {});
console.log('DraftTransaction response:', draftTransaction);

const finalized = await client.SignTransaction(draftTransaction);
const transaction = await client.RecordTransaction(finalized, draftTransaction.id, {});
console.log('Transaction with OP_RETURN:', transaction);

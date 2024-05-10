import { OpReturn, SpvWalletClient, TransactionConfigInput } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys.js';

const server = 'http://localhost:3003/v1';

const client = new SpvWalletClient(server, {
  xPriv: exampleXPriv,
});

const opReturn: OpReturn = {
  string_parts: ['hello', 'world'],
};

const transactionConfig: TransactionConfigInput = {
  outputs: [
    {
      op_return: opReturn,
    },
  ],
};

const draftTransaction = await client.DraftTransaction(transactionConfig, {});
console.log('DraftTransaction response:', draftTransaction);

const finalized = await client.SignTransaction(draftTransaction);
const transaction = await client.RecordTransaction(finalized, draftTransaction.id, {});
console.log('Transaction with OP_RETURN:', transaction);

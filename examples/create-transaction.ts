import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003/api/v1';

if (!exampleXPriv) {
  console.log(errMessage('xPriv'));
  process.exit(1);
}

const client = new SpvWalletClient(server, {
  xPriv: exampleXPriv,
});

const newTransaction = await client.SendToRecipients(
  {
    outputs: [
      {
        to: 'tx2@wojtek.test.4chain.space',
        satoshis: 1,
      }
    ]
  },
  { some_metadata: 'example' },
);

console.log('SendToRecipients response:', newTransaction);

const tx = await client.GetTransactionById(newTransaction.id);
console.log('GetTransaction response:', tx);

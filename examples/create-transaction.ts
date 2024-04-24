import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys';

const server = 'http://localhost:3003/v1';

const client = new SpvWalletClient(server, {
  xPriv: exampleXPriv,
});

const newTransaction = await client.SendToRecipients(
  [
    {
      to: 'receiver@example.com',
      satoshis: 1,
    },
  ],
  { some_metadata: 'example' },
);
console.log('SendToRecipients response:', newTransaction);

const tx = await client.GetTransaction(newTransaction.id() as string);
console.log('GetTransaction response:', tx);

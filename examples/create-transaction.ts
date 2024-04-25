import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';

const server = 'http://localhost:3003/v1';

const client = new SpvWalletClient(server, {
  xPriv: 'xprv9s21ZrQH143K2LpsdRco6N9RvxvxwaWoBK9i4dk2hVwJ9tBPr1qQY6Bxo7dfK2QpevbCFaCFGekAoSPxjLxwvYyUhHXkL5RUct2m7dpf3ZX',
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

const tx = await client.GetTransaction(newTransaction.id('hex') as string);
console.log('GetTransaction response:', tx);

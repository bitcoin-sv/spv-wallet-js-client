import { SpvWalletClient, getKeysFromMnemonic } from '../dist/typescript-npm-package.cjs.js';

const server = 'http://localhost:3003/v1';
const xpriv = 'xprv9s21ZrQH143K27yEYnxfCk5sfD6hdCVvPuKQZRS4rK2zGjK71ufwRGYeMSPLVAMFsxXXiESUCj2SJrJ8r4DwmSbcHsqk5mNrZZrWFfZJKuf';
const mnemonic = "ice dinosaur sister eager cereal erode rather relief wheat catch little flip typical salad dad";

const keys = getKeysFromMnemonic(mnemonic);

const client = new SpvWalletClient(server, {
  xPriv: xpriv,
});

const tx = await client.SendToRecipients(
  [
    {
      to: 'test-tssdk@wojtek.4chain.space',
      satoshis: 1,
    },
  ],
  { some_metadata: 'example' },
);
// const finalized = await client.SignTransaction(draft);

console.log(tx.id() as string);

// const newTransaction = await client.SendToRecipients
// console.log('SendToRecipients response:', newTransaction);
//
// const tx = await client.GetTransaction(newTransaction.id);
// console.log('GetTransaction response:', tx);

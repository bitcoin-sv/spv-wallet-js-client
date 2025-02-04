import {
  ErrorNoAdminKey,
  ErrorResponse,
  SPVWalletUserAPI,
  SpvWalletError,
} from '../dist/typescript-npm-package.cjs.js';
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

try {
  const newTransaction = await client.sendToRecipients(
    {
      outputs: [
        {
          to: 'receiver@example.com',
          satoshis: 1,
        },
      ],
    },
    { some_metadata: 'example' },
  );
  console.log('SendToRecipients response:', newTransaction);

  const tx = await client.transaction(newTransaction.id);
  console.log('GetTransaction response:', tx);
} catch (e) {
  if (e instanceof SpvWalletError) {
    // You can check the type of the error and do something specific
    if (e instanceof ErrorResponse) {
      console.error('Response status:', e.response.status);
      console.error('Content:', e.content);
    } else if (e instanceof ErrorNoAdminKey) {
      console.error('ErrorNoAdminKey', e.message);
    } else {
      //check all the other error types here: src/errors.ts
      console.error('SpvWalletError:', e.message);
    }
  } else {
    console.log('Unknown error:', e);
  }
}

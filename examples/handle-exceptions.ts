import { ErrorNoAdminKey, ErrorResponse, SpvWalletClient, SpvWalletError } from '../dist/typescript-npm-package.cjs.js';
import { exampleXPub } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

if (!exampleXPub) {
  console.log(errMessage('xPub'));
  process.exit(1);
}

try {
  const client = new SpvWalletClient(server, {
    xPub: exampleXPub,
  });

  //we're trying to make an admin request without adminKey
  //the following line will throw ErrorNoAdminKey
  const status = await client.AdminGetStatus();
  console.log('Status:', status);
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

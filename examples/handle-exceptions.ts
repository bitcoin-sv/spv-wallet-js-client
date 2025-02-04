import {
  ErrorNoAdminKey,
  ErrorResponse,
  SPVWalletAdminAPI,
  SpvWalletError,
} from '../dist/typescript-npm-package.cjs.js';
import { exampleXPriv } from './example-keys.js';
const server = 'http://localhost:3003';

try {
  const client = new SPVWalletAdminAPI(server, {adminKey : exampleXPriv});

  //we're trying to make an admin request without adminKey
  //the following line will throw ErrorResponse
  const status = await client.status();
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

import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003/v1';

if (!exampleAdminKey) {
  console.log(errMessage('adminKey'));
  process.exit(1);
}

const adminClient = new SpvWalletClient(server, {
  adminKey: exampleAdminKey,
});

const webhookSuccessfullyUnsubscribed = await adminClient.AdminDeleteWebhook('https://example.com');
console.log('Webhook response:', webhookSuccessfullyUnsubscribed);

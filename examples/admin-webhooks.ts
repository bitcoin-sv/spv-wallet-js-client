import { SPVWalletAdminAPI } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey } from './example-keys.js';
import { errMessage } from './utils.js';

const server = 'http://localhost:3003';

if (!exampleAdminKey) {
  console.log(errMessage('adminKey'));
  process.exit(1);
}

const adminClient = new SPVWalletAdminAPI(server, {adminKey : exampleAdminKey});

const webhookSuccessfullySubscribed = await adminClient.subscribeWebhook(
  'https://example.com',
  'tokenHeader',
  'tokenValue',
);
console.log('Webhook added:', webhookSuccessfullySubscribed);

const webhooks = await adminClient.webhooks();
console.log('Webhooks:', webhooks);

const webhookSuccessfullyUnsubscribed = await adminClient.unsubscribeWebhook('https://example.com');
console.log('Webhook deleted:', webhookSuccessfullyUnsubscribed);

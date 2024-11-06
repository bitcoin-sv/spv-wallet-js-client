import { registerHandler, SpvWalletClient, WebhookManager, StringEvent } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey } from './example-keys.js';
import { errMessage } from './utils.js';
import http from 'http';
import express from 'express';

const server = 'http://localhost:3003';

if (!exampleAdminKey) {
  console.log(errMessage('adminKey'));
  process.exit(1);
}

const client = new SpvWalletClient(server, {
  adminKey: exampleAdminKey,
});

const wh = new WebhookManager(client, 'http://localhost:5005/notification', {
  tokenValue: 'Authorization',
  tokenHeader: 'this-is-the-token',
  processors: 3,
});

try {
  const app = express();
  app.use(express.json());

  await wh.subscribe();

  app.all('/notification', (req, res) => wh.httpHandler(req, res));
  const server = http.createServer(app);

  const allWebhooks = await client.AdminGetWebhooks();
  console.log('Subscribed webhooks list\n');
  for (const w of allWebhooks) {
    console.log(`URL: ${w.url}, banned: ${w.banned}\n`);
  }

  registerHandler(wh, 'StringEvent', (event) => {
    setTimeout(() => {
      console.log(`\n\nProcessing event-string: ${event.value}\n\n`);
    }, 50);
  });

  registerHandler(wh, 'TransactionEvent', (event) => {
    setTimeout(() => {
      console.log(
        `\n\nProcessing event-transaction: xpubId: ${event.xpubId}, txId: ${event.transactionId}, status: ${event.status}\n\n`,
      );
    }, 50);
  });

  server.listen(5005, () => {
    console.log('Server listening on port 5005');
  });

  server.on('close', async () => {
    try {
      // Unsubscribe from the webhook
      await wh.unsubscribe();
      console.log('Successfully unsubscribed from webhook');
    } catch (error) {
      console.error('Error during unsubscribe:', error);
    }
  });
} catch (error) {
  console.log(error);
}

// func main() {
//
//
//
// 	// wait for signal to shutdown
// 	sigChan := make(chan os.Signal, 1)
// 	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
// 	<-sigChan
//
// 	fmt.Printf("Unsubscribing...\n")
// 	if err = wh.Unsubscribe(context.Background()); err != nil {
// 		examples.GetFullErrorMessage(err)
// 		os.Exit(1)
// 	}
//
// 	fmt.Printf("Shutting down...\n")
// 	if err = server.Shutdown(context.Background()); err != nil {
// 		examples.GetFullErrorMessage(err)
// 		os.Exit(1)
// 	}
// }

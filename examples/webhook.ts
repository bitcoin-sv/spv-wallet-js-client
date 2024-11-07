import { SpvWalletClient, WebhookManager, WebhookHttpHandler, RawEvent } from '../dist/typescript-npm-package.cjs.js';
import { exampleAdminKey } from './example-keys.js';
import { errMessage } from './utils.js';
// import http from 'http';
// import express, { Response, Request } from 'express';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';

// NOTE: ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// THIS IS AN EXAMPLE ON HOW YOU CAN SET UP A WEBHOOK NOTIFIER
// It is made in such a way that it is possible to use any lib you want for sending and reveiving requests
// This example covers 2 node frameworks fastify and express. If you want to use express just uncomment what is already
// commented and comment related stuff to fastify.
// That way it's the client that uses spv-wallet-js-client that needs to implement an interface and it's free to do so
// in any library they choose.
// NOTE: ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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
});

// +++++++++++++++++++++++++++++++++++++++++++++++++ EXPRESS EXAMPLE +++++++++++++++++++++++++++++++++++++++++++++++++

// class ExpressHttpHandler implements WebhookHttpHandler {
//   private req: Request;
//   private res: Response;
//
//   constructor(req: Request, res: Response) {
//     this.req = req;
//     this.res = res;
//   }
//   getHeader(name: string): string {
//     return this.req.get(name) || '';
//   }
//   handleResponse(status: number, body?: any): void {
//     if (body) {
//       this.res.status(status).json(body);
//     } else {
//       this.res.sendStatus(status);
//     }
//   }
//   getBody() {
//     const events: RawEvent[] = this.req.body;
//     return events;
//   }
// }

// try {
//   const app = express();
//   app.use(express.json());
//
//   await wh.subscribe();

//   app.all('/notification', (req, res) => {
//     const expressHttpHandler = new ExpressHttpHandler(req, res);
//     wh.handleIncomingEvents(expressHttpHandler);
//     // wh.httpHandler(req, res);
//   });
//   const server = http.createServer(app);
//
//   const allWebhooks = await client.AdminGetWebhooks();
//   console.log('Subscribed webhooks list\n');
//   for (const w of allWebhooks) {
//     console.log(`URL: ${w.url}, banned: ${w.banned}\n`);
//   }
//
//   wh.registerHandler('StringEvent', (event) => {
//     console.log(`\n\nProcessing event-string: ${event.value}\n\n`);
//     return Promise.resolve();
//   });
//
//   wh.registerHandler('TransactionEvent', (event) => {
//     console.log(
//       `\n\nProcessing event-transaction: xpubId: ${event.xpubId}, txId: ${event.transactionId}, status: ${event.status}\n\n`,
//     );
//     return Promise.resolve();
//   });
//
//   server.listen(5005, () => {
//     console.log('Server listening on port 5005');
//   });
//
//   server.on('close', async () => {
//     try {
//       // Unsubscribe from the webhook
//       await wh.unsubscribe();
//       console.log('Successfully unsubscribed from webhook');
//     } catch (error) {
//       console.error('Error during unsubscribe:', error);
//     }
//   });
// } catch (error) {
//   console.log(error);
// }

// +++++++++++++++++++++++++++++++++++++++++++++++++ FASTIFY EXAMPLE +++++++++++++++++++++++++++++++++++++++++++++++++

class FastifyHttpHandler implements WebhookHttpHandler {
  private req: FastifyRequest<{ Body: RawEvent[] }>;
  private res: FastifyReply;

  constructor(req: FastifyRequest<{ Body: RawEvent[] }>, res: FastifyReply) {
    this.req = req;
    this.res = res;
  }
  getHeader(name: string): string {
    return (this.req.headers[name.toLowerCase()] as string) || '';
  }
  handleResponse(status: number, body?: any): void {
    if (body) {
      this.res.status(status).send(body);
    } else {
      this.res.status(status).send();
    }
  }
  getBody() {
    return this.req.body;
  }
}

try {
  const fastify = Fastify({
    logger: true,
  });

  await wh.subscribe();

  fastify.all('/notification', (req: FastifyRequest<{ Body: RawEvent[] }>, reply) => {
    const fastifyHttpHandler = new FastifyHttpHandler(req, reply);
    wh.handleIncomingEvents(fastifyHttpHandler);
  });

  const allWebhooks = await client.AdminGetWebhooks();
  console.log('Subscribed webhooks list\n');
  for (const w of allWebhooks) {
    console.log(`URL: ${w.url}, banned: ${w.banned}\n`);
  }

  wh.registerHandler('StringEvent', (event) => {
    console.log(`\n\nProcessing event-string: ${event.value}\n\n`);
    return Promise.resolve();
  });

  wh.registerHandler('TransactionEvent', (event) => {
    console.log(
      `\n\nProcessing event-transaction: xpubId: ${event.xpubId}, txId: ${event.transactionId}, status: ${event.status}\n\n`,
    );
    return Promise.resolve();
  });

  const start = async () => {
    try {
      await fastify.listen({ port: 5005 });
    } catch (err) {
      fastify.log.error(err);
      await wh.unsubscribe();
      console.log('Successfully unsubscribed from webhook');
      process.exit(1);
    }
  };

  start();
} catch (error) {
  console.log(error);
}

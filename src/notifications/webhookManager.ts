import { SpvWalletClient } from '../client';
import { EventsMap } from './eventsMap';
import { RawEvent, WebhookOptions } from './interface';
import os from 'os';
import { Request, Response } from 'express';

export class WebhookManager {
  public url: string;
  public options: WebhookOptions;
  public buffer: Array<RawEvent>;
  public subscriber: SpvWalletClient;
  public handlers: EventsMap;

  constructor(subscriber: SpvWalletClient, url: string, options: WebhookOptions = {}) {
    this.url = url;
    this.subscriber = subscriber;
    this.options = {
      ...options,
      tokenValue: options.tokenValue || '',
      tokenHeader: options.tokenHeader || '',
      processors: options.processors || os.cpus().length,
      bufferSize: options.bufferSize || 100,
    };
    this.buffer = [];
    this.handlers = new EventsMap();

    for (let i = 0; i < this.options.processors!; i++) {
      // THIS IS THE PROBLEM. IT ONLY GETS TRIGGERED ONCE
      this.processEvents();
    }
  }

  subscribe() {
    return this.subscriber.AdminSubscribeWebhook(this.url, this.options.tokenHeader!, this.options.tokenValue!);
  }

  unsubscribe() {
    return this.subscriber.AdminDeleteWebhook(this.url);
  }

  async httpHandler(req: Request, res: Response) {
    console.log('\n\n HTTP HANDLER \n\n');
    const token = req.headers[this.options.tokenHeader!.toLowerCase()];
    if (this.options.tokenHeader !== '' && token !== this.options.tokenValue) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    try {
      const events: RawEvent[] = req.body;

      events.forEach((event) => {
        if (this.buffer.length < this.options.bufferSize!) {
          this.buffer.push(event);
        }
      });

      // this.processEvents();

      res.status(200);
    } catch (error) {
      res.status(500).json({ message: 'error processing events' });
    }
  }

  private async processEvents() {
    while (this.buffer.length > 0) {
      console.log(this.buffer.length);
      const event = this.buffer.shift();
      if (event) {
        const handler = this.handlers.load(event.type);
        if (handler) {
          handler.emit(event.type, event.content);
        } else {
          console.warn(`No handler registered for event type: ${event.type}`);
        }
      }
    }
  }
}

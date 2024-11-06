import { SpvWalletClient } from '../client';
import { Events } from '../types';
import { EventsMap } from './eventsMap';
import { EventHandler, RawEvent, WebhookOptions } from './interface';
import { Request, Response } from 'express';

export class WebhookManager {
  public url: string;
  public options: WebhookOptions;
  public subscriber: SpvWalletClient;
  public handlers: EventsMap;

  constructor(subscriber: SpvWalletClient, url: string, options: WebhookOptions = {}) {
    this.url = url;
    this.subscriber = subscriber;
    this.options = {
      tokenValue: options.tokenValue || '',
      tokenHeader: options.tokenHeader || '',
    };
    this.handlers = new EventsMap();
  }

  subscribe() {
    return this.subscriber.AdminSubscribeWebhook(this.url, this.options.tokenHeader!, this.options.tokenValue!);
  }

  unsubscribe() {
    return this.subscriber.AdminDeleteWebhook(this.url);
  }

  async httpHandler(req: Request, res: Response) {
    const token = req.headers[this.options.tokenHeader!.toLowerCase()];
    if (this.options.tokenHeader !== '' && token !== this.options.tokenValue) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    try {
      const events: RawEvent[] = req.body;

      events.forEach((event) => {
        const handler = this.handlers.load(event.type);
        if (handler) {
          handler.emit(event.type, event.content);
        } else {
          console.warn(`No handler registered for event type: ${event.type}`);
        }
      });

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'error processing events' });
    }
  }

  registerHandler<T extends keyof Events>(eventName: T, handlerFunction: EventHandler<Events[T]>) {
    this.handlers.store(eventName, handlerFunction);
  }
}

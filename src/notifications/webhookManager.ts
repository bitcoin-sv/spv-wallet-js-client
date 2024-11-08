import { SpvWalletClient } from '../client';
import { Events } from '../types';
import { EventsMap } from './eventsMap';
import { EventHandler, RawEvent, WebhookHttpHandler, WebhookOptions } from './interface';

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
    this.handlers = new EventsMap(subscriber.logger);
  }

  subscribe() {
    return this.subscriber.AdminSubscribeWebhook(this.url, this.options.tokenHeader!, this.options.tokenValue!);
  }

  unsubscribe() {
    return this.subscriber.AdminDeleteWebhook(this.url);
  }

  async handleIncomingEvents(httpHandler: WebhookHttpHandler) {
    const token = httpHandler.getHeader(this.options.tokenHeader!);
    if (this.options.tokenHeader !== '' && token !== this.options.tokenValue) {
      httpHandler.handleResponse(401, { message: 'Unauthorized' });
      return;
    }

    try {
      const events: RawEvent[] = httpHandler.getBody();

      events.forEach((event) => {
        const handler = this.handlers.load(event.type);
        if (handler) {
          handler.emit(event.type, event.content);
        } else {
          this.subscriber.logger.warn(`No handler registered for event type: ${event.type}`);
        }
      });

      httpHandler.handleResponse(200);
    } catch (error) {
      console.error(error);
      httpHandler.handleResponse(500, { message: 'error processing events' });
    }
  }

  registerHandler<T extends keyof Events>(eventName: T, handlerFunction: EventHandler<Events[T]>) {
    this.handlers.store(eventName, handlerFunction);
  }
}

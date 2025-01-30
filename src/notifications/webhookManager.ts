import { SPVWalletAdminAPI } from '../admin-api';
import { Events } from '../types';
import { EventsMap } from './eventsMap';
import { EventHandler, RawEvent, WebhookHttpHandler, WebhookOptions } from './interface';

export class WebhookManager {
  public url: string;
  public options: WebhookOptions;
  public subscriber: SPVWalletAdminAPI;
  public handlers: EventsMap;

  constructor(subscriber: SPVWalletAdminAPI, url: string, options: WebhookOptions = {}) {
    this.url = url;
    this.subscriber = subscriber;
    this.options = {
      tokenValue: options.tokenValue || '',
      tokenHeader: options.tokenHeader || '',
    };
    this.handlers = new EventsMap(subscriber.logger);
  }

  subscribe() {
    return this.subscriber.subscribeWebhook(this.url, this.options.tokenHeader!, this.options.tokenValue!);
  }

  unsubscribe() {
    return this.subscriber.unsubscribeWebhook(this.url);
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
          this.subscriber.logger.debug(`No handler registered for event type: ${event.type}`);
        }
      });

      httpHandler.handleResponse(200);
    } catch (error) {
      if (error instanceof Error) {
        this.subscriber.logger.error(error.message);
      } else {
        this.subscriber.logger.error('Unknown error during event handling');
      }

      httpHandler.handleResponse(500, { message: 'error processing events' });
    }
  }

  registerHandler<T extends keyof Events>(eventName: T, handlerFunction: EventHandler<Events[T]>) {
    this.handlers.store(eventName, handlerFunction);
  }
}

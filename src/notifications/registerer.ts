import { Events } from '../types';
import { EventHandler } from './interface';
import { WebhookManager } from './webhookManager';

export function registerHandler<T extends keyof Events>(
  webhook: WebhookManager,
  eventName: T,
  handlerFunction: EventHandler<Events[T]>,
) {
  webhook.handlers.store(eventName, handlerFunction);
}

import EventEmitter from 'events';
import { EventHandler } from './interface';
import { Events } from '../types';
import { Logger } from '../logger';

export class EventsMap {
  private logger: Logger;
  private registered: Map<string, EventEmitter>;

  constructor(logger: Logger) {
    this.registered = new Map();
    this.logger = logger;
  }

  store<T extends keyof Events>(eventName: string, handler: EventHandler<Events[T]>) {
    if (!this.registered.has(eventName)) {
      this.registered.set(eventName, new EventEmitter());
    }

    this.registered.get(eventName)?.on(eventName, async (event: Events[T]) => {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(`Error in handler for event ${eventName}`, error);
      }
    });
  }

  load(eventName: string): EventEmitter | undefined {
    return this.registered.get(eventName);
  }
}

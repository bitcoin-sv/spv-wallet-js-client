import EventEmitter from 'events';

export class EventsMap {
  private registered: Map<string, EventEmitter>;

  constructor() {
    this.registered = new Map();
  }
  store(eventName: string, handler: (...args: any[]) => Promise<void>) {
    if (!this.registered.has(eventName)) {
      this.registered.set(eventName, new EventEmitter());
    }

    this.registered.get(eventName)?.on(eventName, async (...args: any[]) => {
      try {
        await handler(...args);
      } catch (error) {
        console.error(`Error in handler for event ${eventName}`, error);
      }
    });
  }

  load(eventName: string): EventEmitter | undefined {
    return this.registered.get(eventName);
  }
}

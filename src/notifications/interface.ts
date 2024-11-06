export interface RawEvent {
  type: string;
  content: any; // JSON data
}

export interface WebhookOptions {
  tokenHeader?: string;
  tokenValue?: string;
}

export type EventHandler<T> = (event: T) => Promise<void>;

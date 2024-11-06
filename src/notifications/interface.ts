export interface RawEvent {
  type: string;
  content: any; // JSON data
}

export interface WebhookOptions {
  tokenHeader?: string;
  tokenValue?: string;
  bufferSize?: number;
  rootContext?: any;
  processors?: number;
}

export type EventHandler<T> = (event: T) => void;

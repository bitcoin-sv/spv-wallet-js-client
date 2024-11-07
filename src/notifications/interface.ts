export interface RawEvent {
  type: string;
  content: any; // JSON data
}

export interface WebhookOptions {
  tokenHeader?: string;
  tokenValue?: string;
}

export interface WebhookHttpHandler {
  // should get header from the request
  getHeader(name: string): string;

  // should handle the response from the server
  handleResponse(status: number, body?: any): void;

  // should return the body from the request
  getBody(): RawEvent[];
}

export type EventHandler<T> = (event: T) => Promise<void>;

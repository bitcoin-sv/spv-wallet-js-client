import { HD, PrivateKey } from '@bsv/sdk';
import { AuthHeader, setSignature } from './authentication';
import { Logger } from './logger';
import { ErrorNoAdminKey, ErrorResponse } from './errors';
import { HttpMethod } from './types';

export class HttpClient {
  private logger: Logger;

  private adminKey?: HD;
  private signingKey?: HD | PrivateKey;
  private xPubString?: string;
  private baseUrl: string;

  constructor(logger: Logger, url: string, key?: string | HD | PrivateKey, adminKey?: string) {
    if (key != null) {
      if (typeof key === 'string') {
        //only xPub can be a string
        this.xPubString = key;
      } else {
        this.signingKey = key;
      }
    }
    if (adminKey) {
      this.adminKey = new HD().fromString(adminKey);
    }
    this.logger = logger;
    this.baseUrl = url.endsWith('/') ? url : url + '/'; //make sure the url ends with a '/'
  }

  async adminRequest(path: string, method: HttpMethod = 'GET', payload: any = null): Promise<any> {
    if (!this.hasAdminKey()) {
      throw new ErrorNoAdminKey();
    }
    this.logger.debug('Making request as admin on', method, path);
    return this.makeRequest(path, method, payload, this.adminKey);
  }

  async request(path: string, method: HttpMethod = 'GET', payload: any = null): Promise<any> {
    this.logger.debug('Making request on', method, path);
    return this.makeRequest(path, method, payload, this.signingKey);
  }

  hasAdminKey() {
    return this.adminKey != null;
  }

  private async makeRequest(
    path: string,
    method: HttpMethod,
    payload: any,
    currentSigningKey?: HD | PrivateKey,
  ): Promise<any> {
    const json = payload ? JSON.stringify(payload) : null;
    let headers: Record<string, string> = { 'content-type': 'application/json' };

    if (currentSigningKey != null) {
      headers = setSignature(headers, currentSigningKey, json || '');
    } else if (this.xPubString) {
      headers[AuthHeader] = this.xPubString;
    }

    const res = await globalThis.fetch(this.prepareUrl(path), {
      method,
      headers,
      body: json,
    });

    if (res.ok) {
      const contentType = res.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return res.json();
      }
      return res.text();
    } else {
      const rawContent = await res.text();
      throw new ErrorResponse(this.logger, res, rawContent);
    }
  }

  private prepareUrl(path: string): string {
    path = path.startsWith('/') ? path.substring(1) : path;
    return this.baseUrl + path;
  }
}

import bsv from 'bsv';
import { AuthHeader, setSignature } from './authentication';
import { Logger } from './logger';
import { ErrorNoAdminKey, ErrorResponse } from './errors';

export class Requester {
  private logger: Logger;

  private adminKey?: bsv.HDPrivateKey;
  private signingKey?: bsv.HDPrivateKey | bsv.PrivateKey;
  private xPubString?: string;
  private url: string;

  static CreateSigningRequester(
    logger: Logger,
    url: string,
    signingKey?: bsv.HDPrivateKey | bsv.PrivateKey,
    adminKey?: bsv.HDPrivateKey,
  ) {
    const requester = new Requester(logger, url);
    requester.signingKey = signingKey;
    requester.adminKey = adminKey;
    return requester;
  }

  static CreateXPubRequester(logger: Logger, url: string, xPubString: string) {
    const requester = new Requester(logger, url);
    requester.xPubString = xPubString;
    return requester;
  }

  private constructor(logger: Logger, url: string) {
    this.logger = logger;
    this.url = url.endsWith('/') ? url : url + '/'; //make sure the url ends with a '/'
  }

  async AdminRequest(path: string, method: string = 'GET', payload: any = null): Promise<any> {
    if (!this.adminKey) {
      throw new ErrorNoAdminKey();
    }
    this.logger.debug('Making AdminRequest', path);
    return this.makeRequest(path, method, payload, this.adminKey);
  }

  async Request(path: string, method: string = 'GET', payload: any = null): Promise<any> {
    this.logger.debug('Making Request', path);
    return this.makeRequest(path, method, payload, this.signingKey);
  }

  private async makeRequest(
    path: string,
    method: string,
    payload: any,
    currentSigningKey?: bsv.HDPrivateKey | bsv.PrivateKey,
  ): Promise<any> {
    const json = payload ? JSON.stringify(payload) : null;
    let headers: Record<string, string> = { 'content-type': 'application/json' };

    if (currentSigningKey != null) {
      headers = setSignature(headers, currentSigningKey, json || '');
    } else if (this.xPubString) {
      headers[AuthHeader] = this.xPubString;
    }

    const req = {
      method,
      headers,
      body: json,
    };

    const res = await global.fetch(this.prepareUrl(path), req);

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
    return this.url + path;
  }
}

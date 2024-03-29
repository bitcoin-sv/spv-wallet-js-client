import bsv from 'bsv';
import { AuthHeader, setSignature } from './authentication';
import { Logger } from './logger';
import { ErrorNoAdminKey, ErrorResponse } from './errors';

export class Requester {
  private logger: Logger;

  private adminKey?: bsv.HDPrivateKey;
  private signingKey?: bsv.HDPrivateKey | bsv.PrivateKey;
  private xPubString?: string;

  static CreateSigningRequester(
    logger: Logger,
    signingKey?: bsv.HDPrivateKey | bsv.PrivateKey,
    adminKey?: bsv.HDPrivateKey,
  ) {
    const requester = new Requester(logger);
    requester.signingKey = signingKey;
    requester.adminKey = adminKey;
    return requester;
  }

  static CreateXPubRequester(logger: Logger, xPubString: string) {
    const requester = new Requester(logger);
    requester.xPubString = xPubString;
    return requester;
  }

  private constructor(logger: Logger) {
    this.logger = logger;
  }

  async AdminRequest(url: string, method: string = 'GET', payload: any = null): Promise<any> {
    if (!this.adminKey) {
      throw new ErrorNoAdminKey();
    }
    this.logger.debug('Making AdminRequest', url);
    return this.makeRequest(url, method, payload, this.adminKey);
  }

  async Request(url: string, method: string = 'GET', payload: any = null): Promise<any> {
    this.logger.debug('Making Request', url);
    return this.makeRequest(url, method, payload, this.signingKey);
  }

  private async makeRequest(
    url: string,
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

    const res = await global.fetch(url, req);

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
}

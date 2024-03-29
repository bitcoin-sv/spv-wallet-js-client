import bsv from 'bsv'
import { AuthHeader, setSignature } from './authentication'
import { Logger } from './logger/logger'

export class Requester {
  private adminKey?: bsv.HDPrivateKey
  private signingKey?: bsv.HDPrivateKey | bsv.PrivateKey
  private xPubString?: string

  static CreateSigningRequester(signingKey?: bsv.HDPrivateKey | bsv.PrivateKey, adminKey?: bsv.HDPrivateKey) {
    if (!signingKey && !adminKey) {
      throw new Error('signingKey or adminKey must be set')
    }
    const requester = new Requester()
    requester.signingKey = signingKey
    requester.adminKey = adminKey
    return requester
  }

  static CreateXPubRequester(xPubString: string) {
    const requester = new Requester()
    requester.xPubString = xPubString
    return requester
  }

  async AdminRequest(url: string, method: string = 'GET', payload: any = null): Promise<any> {
    if (!this.adminKey) {
      throw new Error('Admin key has not been set. Cannot do admin queries')
    }
    return this.makeRequest(url, method, payload, this.adminKey)
  }

  async Request(url: string, method: string = 'GET', payload: any = null): Promise<any> {
    return this.makeRequest(url, method, payload, this.signingKey)
  }

  private async makeRequest(
    url: string,
    method: string,
    payload: any,
    currentSigningKey?: bsv.HDPrivateKey | bsv.PrivateKey
  ): Promise<any> {
    const json = payload ? JSON.stringify(payload) : null
    let headers: Record<string, string> = { 'content-type': 'application/json' }

    if (currentSigningKey != null) {
      headers = setSignature(headers, currentSigningKey, json || '')
    } else if (this.xPubString) {
      headers[AuthHeader] = this.xPubString
    }

    const req = {
      method,
      headers,
      body: json,
    }

    const res = await global.fetch(url, req)

    if (res.ok) {
      const contentType = res.headers.get('Content-Type')
      if (contentType && contentType.includes('application/json')) {
        return res.json()
      }
      return res.text()
    } else {
      const error = await res.text()
      throw new Error(`Status: ${res.status}, Message: ${error}`)
    }
  }
}

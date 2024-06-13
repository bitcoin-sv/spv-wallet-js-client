import { SHA1HMAC } from './sha1hmac';

export type TOTPAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
export type TOTPEncoding = 'hex' | 'ascii';

/**
 * Options for TOTP generation.
 * @param {number} [digits=6] - The number of digits in the OTP.
 * @param {TOTPAlgorithm} [algorithm="SHA-1"] - Algorithm used for hashing.
 * @param {TOTPEncoding} [encoding="hex"] - Encoding used for the OTP.
 * @param {number} [period=30] - The time period for OTP validity in seconds.
 * @param {number} [timestamp=Date.now()] - The current timestamp.
 */
export type TOTPOptions = {
  digits?: number;
  algorithm?: TOTPAlgorithm;
  encoding?: TOTPEncoding;
  period?: number;
  timestamp?: number;
};

export type TOTPValidateOptions = TOTPOptions & {
  skew?: number;
};

export class TOTP {
  /**
   * Generates a Time-based One-Time Password (TOTP).
   * @async
   * @param {string} key - The secret key for TOTP.
   * @param {TOTPOptions} options - Optional parameters for TOTP.
   * @returns {Promise<{otp: string, expires: number}>} A promise that resolves to an object containing the OTP and its expiry time.
   */
  static async generate(key: string, options?: TOTPOptions): Promise<{ otp: string; expires: number }> {
    const _options = this.withDefaultOptions(options);

    const counter = this.getCounter(_options.timestamp, _options.period);
    const period = _options.period * 1000;
    const expires = Math.ceil((_options.timestamp + 1) / period) * period;
    const otp = await this.generateHOTP(key, counter, _options);
    return { otp, expires };
  }

  static async validate(key: string, passcode: string, options?: TOTPValidateOptions): Promise<boolean> {
    const _options = this.withDefaultValidateOptions(options);
    passcode = passcode.trim();
    if (passcode.length != _options.digits) {
      return false;
    }

    const counter = this.getCounter(_options.timestamp, _options.period);

    const counters = [counter];
    for (let i = 1; i <= _options.skew; i++) {
      counters.push(counter + i);
      counters.push(counter - i);
    }

    for (let c of counters) {
      if (passcode === (await this.generateHOTP(key, c, _options))) {
        return true;
      }
    }

    return false;
  }

  private static async generateHOTP(key: string, counter: number, options: Required<TOTPOptions>): Promise<string> {
    if (options.encoding === 'ascii') {
      throw new Error('ASCII encoding is not supported');
    }

    const keyBuffer = options.encoding === 'hex' ? this.base32ToBuffer(key) : this.asciiToBuffer(key);
    const keyArray = Array.from(new Uint8Array(keyBuffer));

    const timeHex = this.dec2hex(counter).padStart(16, '0');
    const hmac = new SHA1HMAC(keyArray).update(timeHex, 'hex');

    const signatureHex = hmac.digestHex();

    const offset = this.hex2dec(signatureHex.slice(-1)) * 2;
    const masked = this.hex2dec(signatureHex.slice(offset, offset + 8)) & 0x7fffffff;
    const otp = masked.toString().slice(-options.digits);
    return otp;
  }

  private static withDefaultOptions(options?: TOTPOptions): Required<TOTPOptions> {
    return {
      digits: 6,
      algorithm: 'SHA-1',
      encoding: 'hex',
      period: 30,
      timestamp: Date.now(),
      ...options,
    };
  }

  private static withDefaultValidateOptions(options?: TOTPValidateOptions): Required<TOTPValidateOptions> {
    return {
      digits: 6,
      algorithm: 'SHA-1',
      encoding: 'hex',
      period: 30,
      timestamp: Date.now(),
      skew: 1,
      ...options,
    };
  }

  private static getCounter(timestamp: number, period: number): number {
    const epochSeconds = Math.floor(timestamp / 1000);
    const counter = Math.floor(epochSeconds / period);
    return counter;
  }

  /**
   * Converts a hexadecimal string to a decimal number.
   * @param {string} hex - The hex string.
   * @returns {number} The decimal representation.
   */
  private static hex2dec(hex: string): number {
    return parseInt(hex, 16);
  }

  /**
   * Converts a decimal number to a hexadecimal string.
   * @param {number} dec - The decimal number.
   * @returns {string} The hex representation.
   */
  private static dec2hex(dec: number): string {
    return (dec < 15.5 ? '0' : '') + Math.round(dec).toString(16);
  }

  /**
   * Converts a base32 encoded string to an ArrayBuffer.
   * @param {string} str - The base32 encoded string to convert.
   * @returns {ArrayBuffer} The ArrayBuffer representation of the base32 encoded string.
   */
  private static base32ToBuffer(str: string): ArrayBuffer {
    let length = str.length;
    while (str.charCodeAt(length - 1) === 61) length--; // Remove pads

    const bufferSize = (length * 5) / 8; // Estimate buffer size
    const buffer = new Uint8Array(bufferSize);
    let value = 0,
      bits = 0,
      index = 0;

    for (let i = 0; i < length; i++) {
      const charCode = this.base32[str.charCodeAt(i)];
      if (charCode === undefined) throw new Error('Invalid base32 character in key');
      value = (value << 5) | charCode;
      bits += 5;

      if (bits >= 8) buffer[index++] = value >>> (bits -= 8);
    }
    return buffer.buffer as ArrayBuffer;
  }

  /**
   * Converts an ASCII string to an ArrayBuffer.
   * @param {string} str - The ASCII string to convert.
   * @returns {ArrayBuffer} The ArrayBuffer representation of the ASCII string.
   */
  private static asciiToBuffer(str: string): ArrayBuffer {
    const buffer = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buffer[i] = str.charCodeAt(i);
    }
    return buffer.buffer as ArrayBuffer;
  }

  /**
   * Converts a hexadecimal string to an ArrayBuffer.
   * @param {string} hex - The hexadecimal string to convert.
   * @returns {ArrayBuffer} The ArrayBuffer representation of the hexadecimal string.
   */
  private static hex2buf(hex: string): ArrayBuffer {
    const buffer = new Uint8Array(hex.length / 2);

    for (let i = 0, j = 0; i < hex.length; i += 2, j++) buffer[j] = this.hex2dec(hex.slice(i, i + 2));

    return buffer.buffer as ArrayBuffer;
  }

  /**
   * Converts an ArrayBuffer to a hexadecimal string.
   * @param {ArrayBuffer} buffer - The ArrayBuffer to convert.
   * @returns {string} The hexadecimal string representation of the buffer.
   */
  private static buf2hex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  /**
   * A precalculated mapping from base32 character codes to their corresponding index values for performance optimization.
   * This mapping is used in the base32ToBuffer method to convert base32 encoded strings to their binary representation.
   */
  private static readonly base32: { [key: number]: number } = {
    50: 26,
    51: 27,
    52: 28,
    53: 29,
    54: 30,
    55: 31,
    65: 0,
    66: 1,
    67: 2,
    68: 3,
    69: 4,
    70: 5,
    71: 6,
    72: 7,
    73: 8,
    74: 9,
    75: 10,
    76: 11,
    77: 12,
    78: 13,
    79: 14,
    80: 15,
    81: 16,
    82: 17,
    83: 18,
    84: 19,
    85: 20,
    86: 21,
    87: 22,
    88: 23,
    89: 24,
    90: 25,
  };
}

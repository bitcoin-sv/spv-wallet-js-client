import { TransactionInput } from '@bsv/sdk';
import { Logger } from './logger';
import { ClientOptions, AdminClientOptions, TxInput } from './types';

export class SpvWalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ErrorInvalidClientOptions extends SpvWalletError {
  constructor(logger: Logger, options: ClientOptions) {
    super('Invalid options. None of xPub, xPriv nor accessKey is set');
    logger.debug('Invalid options: ', options);
  }
}

export class ErrorInvalidAdminClientOptions extends SpvWalletError {
  constructor(logger: Logger, options: AdminClientOptions) {
    super('Invalid options. No adminKey set');
    logger.debug('Invalid options: ', options);
  }
}

export class ErrorNoXPrivToSignTransaction extends SpvWalletError {
  constructor() {
    super('Cannot sign transaction without an xPriv');
  }
}

export class ErrorClientInitNoXpriv extends SpvWalletError {
  constructor() {
    super('Init client with xPriv first');
  }
}

export class ErrorTxIdsDontMatchToDraft extends SpvWalletError {
  input: TxInput;
  draftInput: TransactionInput;
  constructor(logger: Logger, input: TxInput, index: number, draftInput: TransactionInput) {
    super('Input tx ids do not match in draft and transaction hex');
    logger.debug('The input: ', input, 'Tx index: ', index, 'The draft', draftInput);

    this.input = input;
    this.draftInput = draftInput;
  }
}

export class ErrorNoAdminKey extends SpvWalletError {
  constructor() {
    super('Admin key has not been set. Cannot do admin queries.');
  }
}

export class ErrorResponse extends SpvWalletError {
  response: Response;
  content: string;
  constructor(logger: Logger, response: Response, content: string) {
    super('Received error response');
    logger.debug('StatusCode:', response.status, 'Error response:', response, 'The content:', content);

    this.response = response;
    this.content = content;
  }
}

export class ErrorWrongHex extends SpvWalletError {
  value: string;
  constructor(wrongHex: string) {
    super('Provided hexHash is not a valid hex string');
    this.value = wrongHex;
  }
}
export class ErrorNoXPrivToGenerateTOTP extends SpvWalletError {
  constructor() {
    super('Cannot generate TOTP without an xPrivKey set');
  }
}

export class ErrorNoXPrivToValidateTOTP extends SpvWalletError {
  constructor() {
    super('Cannot validate TOTP without an xPrivKey set');
  }
}

export class ErrorWrongTOTP extends SpvWalletError {
  constructor() {
    super('TOTP is invalid');
  }
}

export class ErrorSyncMerkleRootsTimeout extends SpvWalletError {
  constructor() {
    super('SyncMerkleRoots operation timed out');
  }
}

export class ErrorStaleLastEvaluatedKey extends SpvWalletError {
  constructor() {
    super(
      'The last evaluated key has not changed between requests, indicating a possible loop or synchronization issue.',
    );
  }
}

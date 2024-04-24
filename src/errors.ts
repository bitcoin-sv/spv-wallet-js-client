import { Transaction, TransactionInput } from '@bsv/sdk';
import { Logger } from './logger';
import { ClientOptions, TxInput } from './types';

export class SpvWalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ErrorInvalidOptions extends SpvWalletError {
  constructor(logger: Logger, options: ClientOptions) {
    super('Invalid options. None of xPub, xPriv, accessKey nor adminKey is set');
    logger.debug('Invalid options: ', options);
  }
}

export class ErrorNoXPrivToSignTransaction extends SpvWalletError {
  constructor() {
    super('Cannot sign transaction without an xPriv');
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

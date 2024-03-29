import bsv from 'bsv';
import { Logger } from './logger';
import { ClientOptions, DraftTransaction, TransactionInput } from './types';

//new Error('Invalid options with signRequest off.');
//new Error('Invalid options with signRequest on.');

//new Error('input tx ids do not match in draft and transaction hex')
//new Error('cannot sign transaction without an xPriv');
//new Error('transaction verification failed');
//new Error('transaction could not be fully signed')

export class ErrorWithDisabledSignRequest extends Error {
  constructor(logger: Logger, options: ClientOptions) {
    logger.debug('Invalid options: ', options);
    super(
      'Invalid options with signRequest off. Must set xPub. For signed requests: must set xPriv or accessKey. AdminKey also needs signRequest option.',
    );
  }
}

export class ErrorNoSigningMethod extends Error {
  constructor(logger: Logger, options: ClientOptions) {
    logger.debug('Invalid options: ', options);
    super('Invalid options with signRequest on. None of xPriv, accessKey nor adminKey is set');
  }
}

export class ErrorNoXPrivToSignTransaction extends Error {
  constructor() {
    super('Cannot sign transaction without an xPriv');
  }
}

export class ErrorTxIdsDontMatchToDraft extends Error {
  input: TransactionInput;
  draftInput: bsv.Transaction.Input;
  constructor(logger: Logger, input: TransactionInput, index: number, draftInput: bsv.Transaction.Input) {
    super('Input tx ids do not match in draft and transaction hex');
    logger.debug('The input: ', input, 'Tx index: ', index, 'The draft', draftInput);

    this.input = input;
    this.draftInput = draftInput;
  }
}

export class ErrorDraftVerification extends Error {
  draft: bsv.Transaction;
  constructor(logger: Logger, draft: bsv.Transaction) {
    super('transaction verification failed');
    logger.debug('The draft transaction:', draft);

    this.draft = draft;
  }
}

export class ErrorDraftFullySign extends Error {
  draft: bsv.Transaction;
  constructor(logger: Logger, draft: bsv.Transaction) {
    super('Transaction could not be fully signed');
    logger.debug('The draft transaction:', draft);

    this.draft = draft;
  }
}

export class ErrorNoAdminKey extends Error {
  constructor() {
    super('Admin key has not been set. Cannot do admin queries.');
  }
}

export class ErrorResponse extends Error {
  response: Response;
  content: string;
  constructor(logger: Logger, response: Response, content: string) {
    super('Received error response');
    logger.debug('StatusCode:', response.status, 'Error response:', response, 'The content:', content);

    this.response = response;
    this.content = content;
  }
}

export class ErrorWrongHex extends Error {
  value: string;
  constructor(wrongHex: string) {
    super('Provided hexHash is not a valid hex string');
    this.value = wrongHex;
  }
}

import { SPVWalletUserAPI, generateKeys } from '../dist/typescript-npm-package.cjs.js';

const server = 'http://localhost:3003';

const newXpriv = generateKeys().xPriv();
// Option 1 - control console log level
const clientWithCustomLogLevel = new SPVWalletUserAPI(
  server,
  {
    xPriv: newXpriv,
  },
  {
    //default level is 'info'
    level: 'debug', //available levels: 'debug' | 'info' | 'warn' | 'error' | 'disabled'
  },
);

//this will log that the request is being made
await clientWithCustomLogLevel.transactions({}, {}, {});

// Option 2 - provide your custom logger
class CustomLogger {
  debug(msg: string, ...args: any[]) {
    //do whatever you want
  }
  info(msg: string, ...args: any[]) {}
  warn(msg: string, ...args: any[]) {}
  error(msg: string, ...args: any[]) {}
}

const clientWithCustomLogger = new SPVWalletUserAPI(
  server,
  {
    xPriv: newXpriv,
  },
  new CustomLogger(),
);
await clientWithCustomLogger.transactions({}, {}, {});

export interface Logger {
  debug(msg: string, ...args: any[]): void;
  info(msg: string, ...args: any[]): void;
  warn(msg: string, ...args: any[]): void;
  error(msg: string, ...args: any[]): void;
}

export const logger: Logger = {
  debug(msg: string, ...args: any[]) {
    console.debug(msg, ...args);
  },
  info(msg: string, ...args: any[]) {
    console.info(msg, ...args);
  },
  warn(msg: string, ...args: any[]) {
    console.warn(msg, ...args);
  },
  error(msg: string, ...args: any[]) {
    console.error(msg, ...args);
  }
};

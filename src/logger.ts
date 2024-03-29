export interface Logger {
  debug(msg: string, ...args: any[]): void;
  info(msg: string, ...args: any[]): void;
  warn(msg: string, ...args: any[]): void;
  error(msg: string, ...args: any[]): void;
}

export interface ConsoleLoggerLevel {
  level: 'debug' | 'info' | 'warn' | 'error' | 'disabled';
}

export type LoggerConfig = Logger | ConsoleLoggerLevel;

const isLogger = (loggerConfig: LoggerConfig): loggerConfig is Logger => {
  const logger = loggerConfig as Logger;
  return (
    typeof logger.debug === 'function' &&
    typeof logger.info === 'function' &&
    typeof logger.warn === 'function' &&
    typeof logger.error === 'function'
  );
};

const nop = () => {};
export const defaultLogger: ConsoleLoggerLevel = { level: 'info' };

const levelToNumber = (level: string): number => {
  switch (level) {
    case 'debug':
      return 1;
    case 'info':
      return 2;
    case 'warn':
      return 3;
    case 'error':
      return 4;
    case 'disabled':
      return 5;
    default:
      return 2;
  }
};

export const makeLogger = (loggerConfig: LoggerConfig): Logger => {
  if (isLogger(loggerConfig)) {
    return loggerConfig;
  } else {
    const { level } = loggerConfig;
    const levelAsNumber = levelToNumber(level);
    return {
      debug: levelAsNumber <= 1 ? console.debug : nop,
      info: levelAsNumber <= 2 ? console.info : nop,
      warn: levelAsNumber <= 3 ? console.warn : nop,
      error: levelAsNumber <= 4 ? console.error : nop,
    };
  }
};

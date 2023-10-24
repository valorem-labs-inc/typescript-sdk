/* eslint-disable @typescript-eslint/no-explicit-any -- console uses any */
/* eslint-disable no-console -- custom console */

export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  SILENT,
}

export interface LoggerConfig {
  logLevel?: LogLevel;
}

type DefaultLogFn = (message?: any, ...rest: any[]) => void;
type CustomLogFn = (level: LogLevel, message?: any, ...rest: any[]) => void;

export class Logger {
  public level: LogLevel;

  constructor({ logLevel = LogLevel.WARN }: LoggerConfig) {
    this.level = logLevel;
  }

  public debug: DefaultLogFn = (...args) => {
    this.#_log(LogLevel.DEBUG, ...args);
  };

  public info: DefaultLogFn = (...args) => {
    this.#_log(LogLevel.INFO, ...args);
  };

  public warn: DefaultLogFn = (...args) => {
    this.#_log(LogLevel.WARN, ...args);
  };

  public error: DefaultLogFn = (...args) => {
    this.#_log(LogLevel.ERROR, ...args);
  };

  #_log: CustomLogFn = (level, message, ...rest) => {
    if (level < this.level) {
      return;
    }

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message, ...rest);
        return;
      case LogLevel.INFO:
        console.info(message, ...rest);
        return;
      case LogLevel.WARN:
        console.warn(message, ...rest);
        return;
      case LogLevel.ERROR:
        console.error(message, ...rest);
        break;
      default:
        break;
    }
  };
}

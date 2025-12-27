import winston from "winston";

class loggerClass {
  private static instance: loggerClass;
  private winston: winston.Logger;

  private constructor() {
    this.winston = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
          return `[${timestamp}] ${level}: ${message}${metaString}`;
        }),
      ),
      transports: [
        // ...(process.env.NODE_ENV !== "production"
        //   ? [
        //       new winston.transports.File({
        //         filename: "logs/error.log",
        //         level: "info",
        //       }),
        //     ]
        //   : []),
        new winston.transports.Console(),
      ],
    });
  }

  public static getInstance(): loggerClass {
    if (!loggerClass.instance) {
      loggerClass.instance = new loggerClass();
    }
    return loggerClass.instance;
  }

  public log(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  public error(
    error: Error | string | unknown,
    context?: Record<string, any>,
  ): void {
    let errorMessage: string;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = "An unknown error occurred";
    }

    this.winston.error(errorMessage, context);
  }
}

export const logger = loggerClass.getInstance();

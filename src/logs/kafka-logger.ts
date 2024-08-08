import winston from 'winston';
import { logLevel } from 'kafkajs';
import config from '../config/config';

const toWinstonLogLevel = (level: logLevel) => {
  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      return 'error';
    case logLevel.WARN:
    default:
      return 'warn';
    case logLevel.INFO:
      return 'info';
    case logLevel.DEBUG:
      return 'debug';
  }
};

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logCreatorForMessages = (logLevel: any) => {
  const logger = winston.createLogger({
    level: toWinstonLogLevel(logLevel),
    format: winston.format.combine(
      enumerateErrorFormat(),
      config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
      winston.format.splat(),
      winston.format.printf(
        ({ level, message }) => `${new Date().toLocaleString()} ${level}: KAFKA ${message}`
      )
    ),
    transports: [
      new winston.transports.Console()
      // new winston.transports.File({ filename: './src/logfiles/kafka-info.log', level: 'info' }) // will also track error logs
    ]
  });
  return ({ level, log }: { level: number; log: any }) => {
    const { message, ...extra } = log;
    logger.log({
      level: toWinstonLogLevel(level),
      message,
      extra
    });
  };
};

export default logCreatorForMessages;

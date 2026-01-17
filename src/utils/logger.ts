import pino from 'pino';
import { env } from '../config/env';

const isDev = process.env.NODE_ENV !== 'production';

export function getLogger(name: string): pino.Logger {
  const pinoOptions: pino.LoggerOptions = {
    level: env.logLevel,
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
      : undefined,
  };

  const logger = pino(pinoOptions);
  return logger.child({ module: name });
}

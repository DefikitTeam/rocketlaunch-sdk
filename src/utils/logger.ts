const logger = console;
export const log = {
  info: (message: string, ...meta: any[]) => logger.info(message, ...meta),
  warn: (message: string, ...meta: any[]) => logger.warn(message, ...meta),
  error: (message: string, ...meta: any[]) => logger.error(message, ...meta),
  debug: (message: string, ...meta: any[]) => logger.debug(message, ...meta),
};

export default logger;
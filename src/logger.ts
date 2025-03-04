import pino, { Logger } from "pino";

const logger: Logger = pino({
    level: process.env.PINO_LOG_LEVEL || 'info',
});

export default logger;

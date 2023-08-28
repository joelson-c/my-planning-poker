import { injectable } from "tsyringe";
import ILogger from "../contracts/ILogger";
import { Logger as WinstonLogger, createLogger, transports, format } from "winston";
import jsonStringify from 'safe-stable-stringify';

@injectable()
export default class Logger implements ILogger {
    private logger: WinstonLogger;

    constructor() {
        const messageFormat = format.printf(({ level, message, timestamp, metadata }) => {
            return `${timestamp} ${level}: ${message} ${jsonStringify(metadata)}`;
        });

        this.logger = createLogger({
            format: format.combine(
                format.colorize(),
                format.splat(),
                format.metadata(),
                format.timestamp(),
                messageFormat
            ),
            transports: [
                new transports.Console()
            ]
        });
    }

    info(message: string, data: object): void {
        this.logger.info(message, data);
    }

    warn(message: string, data: object): void {
        this.logger.warn(message, data);
    }

    error(message: string, data: object): void {
        this.logger.error(message, data);
    }

    debug(message: string, data: object): void {
        this.logger.debug(message, data);
    }
}

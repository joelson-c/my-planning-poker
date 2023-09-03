export default interface ILogger {
    info(message: string, data?: object): void;
    warn(message: string, data?: object): void;
    error(message: string, data?: object): void;
    debug(message: string, data?: object): void;
}

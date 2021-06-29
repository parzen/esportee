export interface ILoggerService {
    info(msg: string);
    debug(msg: string);
    warn(msg: string);
    error(msg: string);
    log(msg: string);
}
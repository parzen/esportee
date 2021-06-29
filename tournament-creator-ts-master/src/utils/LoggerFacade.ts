import {ILoggerService} from "./ILoggerService";

export class LoggerFacade implements ILoggerService {
    get externalLogger(): ILoggerService {
        return this._externalLogger;
    }

    set externalLogger(value: ILoggerService) {
        this._externalLogger = value;
    }

    private _externalLogger: ILoggerService;

    info(msg: string) {
        if (this._externalLogger) {
            this._externalLogger.info(msg);
        }
    }

    debug(msg: string) {
        if (this._externalLogger) {
            this._externalLogger.debug(msg);
        }
    }

    warn(msg: string) {
        if (this._externalLogger) {
            this._externalLogger.warn(msg);
        }
    }

    error(msg: string) {
        if (this._externalLogger) {
            this._externalLogger.error(msg);
        }
    }

    log(msg: string) {
        if (this._externalLogger) {
            this._externalLogger.log(msg);
        }
    }

}
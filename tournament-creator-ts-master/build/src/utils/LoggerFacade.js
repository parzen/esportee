"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LoggerFacade {
    get externalLogger() {
        return this._externalLogger;
    }
    set externalLogger(value) {
        this._externalLogger = value;
    }
    info(msg) {
        if (this._externalLogger) {
            this._externalLogger.info(msg);
        }
    }
    debug(msg) {
        if (this._externalLogger) {
            this._externalLogger.debug(msg);
        }
    }
    warn(msg) {
        if (this._externalLogger) {
            this._externalLogger.warn(msg);
        }
    }
    error(msg) {
        if (this._externalLogger) {
            this._externalLogger.error(msg);
        }
    }
    log(msg) {
        if (this._externalLogger) {
            this._externalLogger.log(msg);
        }
    }
}
exports.LoggerFacade = LoggerFacade;
//# sourceMappingURL=LoggerFacade.js.map
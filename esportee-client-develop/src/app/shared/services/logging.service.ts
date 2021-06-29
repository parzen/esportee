import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class LoggerService {
  subject = new BehaviorSubject<LoggerMessage>(new LoggerMessage(LoggerLevel.LOG, 'LOGGER STARTED'));
  level: LoggerLevel = LoggerLevel.ERROR;

  constructor() {
    let service = this;
    this.subject.subscribe(this.publishLogMessage,
      function (err) {
        service.error('LOGGER EXCEPTION: ' + err);
      },
      function () {
        service.error('LOGGER TERMINATED');
      });
  }

  setLoggerLevel(level: LoggerLevel) {
    this.level = level;
  }

  publishLogMessage(msg: LoggerMessage) {
    switch (msg.level) {
      case LoggerLevel.ERROR:
        console.error('[ERROR] ' + msg.msg);
        break;
      case LoggerLevel.WARN:
        console.warn('[WARN] ' + msg.msg);
        break;
      case LoggerLevel.INFO:
        console.info('[INFO] ' + msg.msg);
        break;
      case LoggerLevel.DEBUG:
        console.debug('[DEBUG] ' + msg.msg);
        break;
      case LoggerLevel.LOG:
      default:
        console.log('[LOG] ' + msg.msg);
        break;
    }
  }

  getSubject(): BehaviorSubject<LoggerMessage> {
    return this.subject;
  }

  error(msg: string) {
    this.subject.next(new LoggerMessage(LoggerLevel.ERROR, msg));
  }

  warn(msg: string) {
    this.subject.next(new LoggerMessage(LoggerLevel.WARN, msg));
  }

  info(msg: string) {
    this.subject.next(new LoggerMessage(LoggerLevel.INFO, msg));
  }

  debug(msg: string) {
    this.subject.next(new LoggerMessage(LoggerLevel.DEBUG, msg));
  }

  log(msg: string) {
    this.subject.next(new LoggerMessage(LoggerLevel.LOG, msg));
  }

}

export class LoggerMessage {
  level: LoggerLevel;
  msg: string;

  constructor(level: LoggerLevel, msg: string) {
    this.level = level;
    this.msg = msg;
  }
}

export enum LoggerLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
  LOG
}

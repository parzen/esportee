import {Injectable} from '@angular/core';
import {WebSocketMessage} from './websocket.service';
import {IMatch} from 'tournament-creator-ts';
import {StringUtils} from '../utils/string.util';
import {ToasterService} from 'angular5-toaster';
import * as Rx from 'rxjs/Rx';
import {ApiClientService} from '../apiclient/api-client.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public static KEY_NOTIFICATION_UNAPPROVED_MATCH = 'notification.unapprovedmatch';

  public notificationsSubject = new Rx.BehaviorSubject<InAppNotification[]>(null);
  private notifications = new Map<string, InAppNotification>();

  constructor(private apiService: ApiClientService) {
  }

  public showServerMessage(msg: WebSocketMessage) {
    if (msg.type === NotificationService.KEY_NOTIFICATION_UNAPPROVED_MATCH) {
      this.createUnapprovedMatchNotification(msg.data as IMatch);

      /*this.snackbar.open(snackbarMsg, 'APPROVE', {duration: 10000, verticalPosition: 'top'})
        .onAction().subscribe(_ => {
        console.log('AND ACTION!');
      });*/
    }
  }

  public createUnapprovedMatchNotification(match: IMatch) {
    let snackbarMsg = 'Result submitted, please approve: ' + StringUtils.getMatchString(match);
    let notification = {
      id: NotificationService.KEY_NOTIFICATION_UNAPPROVED_MATCH + '.' + match.id,
      title: 'New Match Result Submitted',
      message: snackbarMsg,
      actions: [
        {
          title: 'APPROVE', onFired: () => {
            this.apiService.approveMatchResult(match.id).subscribe((matchApproved) => {
              console.log('Successfully approved')
              this.notifications.delete(NotificationService.KEY_NOTIFICATION_UNAPPROVED_MATCH + '.' + match.id);
              this.notificationsSubject.next(Array.from(this.notifications.values()));
            });
          }
        }
      ]
    };

    this.notifications.set(notification.id, notification);
    this.notificationsSubject.next(Array.from(this.notifications.values()));
  }
}

export interface InAppNotification {
  id?: string,
  title: string,
  message: string,
  type?: string
  actions?: Action[]
}

export enum Type {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface Action {
  title: string,
  onFired: Function;
}

import {Component, OnDestroy, OnInit} from '@angular/core';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {LoadingService} from './shared/services/loading.service';
import {AuthService} from './shared/services/auth.service';
import {Observable} from 'rxjs';
import {IUserInfo} from './shared/apiclient/responses/userinfo.interface';
import {InAppNotification, NotificationService} from './shared/services/notification.service';
import {MatchState} from 'tournament-creator-ts';
import {HasSubscriptions} from './shared/utils/HasSubscriptions';
import {ApiClientService} from './shared/apiclient/api-client.service';
import {FirebaseMessagingService} from './shared/services/firebase-messaging.service';

/*
 * App Component
 * Top Level Component
 */


// TODO: Refactor loading indicator into service

@Component({
  selector: 'my-app', // <my-app></my-app>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent extends HasSubscriptions implements OnDestroy {
  loading: BehaviorSubject<boolean>;
  loggedIn: Observable<boolean>;
  notifications: Observable<InAppNotification[]>;
  user: Observable<IUserInfo>;
  url: string;

  constructor(private authService: AuthService, public loadingService: LoadingService,
              private notificationService: NotificationService, private apiService: ApiClientService,
              private firebaseMessagingService: FirebaseMessagingService) {
    super();
    this.loading = this.loadingService.getSubject();
    this.loggedIn = authService.loggedIn();
    this.notifications = this.notificationService.notificationsSubject;

    this.user = authService.userInfo.map(
      user => {
        this.pullNotifications(user);
        this.firebaseMessagingService.checkPermissionAndToken().then(_ => {
          this.firebaseMessagingService.receiveMessage();
          this.addSubscription(this.firebaseMessagingService.currentMessage.subscribe(
            next => {
              console.log(next);
            }
          ))
        })
        return user;
      }
    );
  }

  pullNotifications(user: IUserInfo): void {
    this.addSubscription(this.apiService.getMatchesFromUser('' + user.id).subscribe(matches => {
      let matchesFinished = matches.data.filter(match => {
        return match.status === MatchState.WAITING_FOR_REPLY
      });

      console.log(matchesFinished);
      matchesFinished.map(match => {
        this.notificationService.createUnapprovedMatchNotification(match);
      });

    }));
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

}

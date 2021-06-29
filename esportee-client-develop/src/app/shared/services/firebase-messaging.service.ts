import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ApiClientService} from '../apiclient/api-client.service';
import {AngularFireMessaging} from '@angular/fire/messaging';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessagingService {

  currentMessage = new BehaviorSubject(null)

  constructor(private apiClient: ApiClientService, private afMessaging: AngularFireMessaging) {
  }

  checkPermissionAndToken(): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      this.afMessaging.requestToken
        .subscribe(
          (token) => {
            resolve(true);
            this.apiClient.updateFcmToken(token)
          },
          (error) => {
            resolve(false);
            console.error(error);
          },
        );
    }));
  }

  receiveMessage() {
    this.afMessaging.messages
      .subscribe((message) => {
        this.currentMessage.next(message);
        console.log(message);
      });

  }
}

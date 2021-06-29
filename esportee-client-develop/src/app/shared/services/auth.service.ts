import {Injectable} from '@angular/core';
import {ApiClientService} from '../apiclient/api-client.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {TokenResponse} from '../apiclient/responses/token-response.interface';
import {EntityIdResponse} from '../apiclient/responses/entity-id-response.interface';
import {IUserInfo} from '../apiclient/responses/userinfo.interface';
import {Router} from '@angular/router';
import {from} from 'rxjs/internal/observable/from';
import {ApiResponse} from '../apiclient/responses/api-response';
import {JwtHelperService} from '@auth0/angular-jwt';
import {NotificationService} from './notification.service';
import {WebsocketService} from './websocket.service';

@Injectable()
export class AuthService {
  loggedInObservable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  userInfo: BehaviorSubject<IUserInfo> = new BehaviorSubject<IUserInfo>(null);
  helper = new JwtHelperService();

  constructor(private apiService: ApiClientService, private router: Router,
              private notificationService: NotificationService, private websocketService: WebsocketService) {
    const token = localStorage.getItem('id_token');
    if (token != null && !this.helper.isTokenExpired(token)) {
      this.init();
    } else {
      console.log('Token is expired or not present!!')
      this.loggedInObservable.next(false);
    }
    this.loggedInObservable.subscribe(next => {
      this.websocketService.connect().subscribe(
        msg => {
          try {
            this.notificationService.showServerMessage(JSON.parse(msg.data));
          } catch (e) {
            console.error(e);
          }
        }, error => {
          console.error(error);
        });
    }, error => {
      this.websocketService.close();
    });
  }

  login(email: string, password: string): Observable<ApiResponse<TokenResponse>> {
    return this.apiService.login(email, password).map(data => {
        localStorage.setItem('id_token', data.data.token.token);
        localStorage.setItem('refresh_token', data.data.token.refreshtoken);
        localStorage.setItem('user_id', data.data.user_id.toString());
        this.init();
        return data;
      },
      error => {
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        this.loggedInObservable.next(false);
        return error;
      });
  }

  private init() {
    this.loadProfile().subscribe(
      data => {
        this.userInfo.next(data.data);
        this.loggedInObservable.next(true);
      },
      error => this.loggedInObservable.next(false)
    );
  }

  logout(): Observable<ApiResponse<boolean>> {
    this.loggedInObservable.next(false);
    let result = this.apiService.logout().map(data => {
        return data;
      },
      error => {
        return error;
      });
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    this.router.navigate(['/']);
    return result;
  }

  loadProfile(): Observable<ApiResponse<IUserInfo>> {
    let user_id = localStorage.getItem('user_id');
    if (user_id != null) {
      return this.apiService.loadUserProfile(user_id);
    } else {
      return from(null);
    }
  }

  register(username: string, email: string, password: string): Observable<ApiResponse<EntityIdResponse>> {
    return this.apiService.register(username, email, password);
  }

  loggedIn(): Observable<boolean> {
    return this.loggedInObservable;
  }
}

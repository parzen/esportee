import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiClientService} from '../shared/apiclient/api-client.service';
import {zip} from 'rxjs/internal/observable/zip';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'app-confirm-mail',
  templateUrl: './confirm-mail.component.html',
  styleUrls: ['./confirm-mail.component.sass']
})
export class ConfirmMailComponent extends HasSubscriptions implements OnInit, OnDestroy {
  token: string;
  email: string;
  success = false;
  error: string;

  constructor(private route: ActivatedRoute, private apiClientService: ApiClientService) {
    super();
  }

  ngOnInit() {
    let tokenObservable = this.route
      .queryParams
      .map(params => params['token']);
    let emailObservable = this.route
      .queryParams
      .map(params => params['email']);

    this.addSubscription(zip(tokenObservable, emailObservable)
      .subscribe((value) => {
        this.token = '' + value[0];
        this.email = '' + value[1];
        this.confirmEmail(this.email, this.token);
      }));
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  confirmEmail(email: string, token: string) {
    this.addSubscription(this.apiClientService.confirmEmail(email, token).subscribe(
      data => {
        this.success = true;
        console.log(data);
      },
      error => {
        if (error.status === 400) {
          this.error = 'Invalid token or email address';
        } else {
          this.error = 'Something failed, please contact support';
        }
      }
    ));
  }

}

import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormUser} from '../shared/models/form-user.model';
import {AuthService} from '../shared/services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'login-form',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent extends HasSubscriptions implements OnInit, OnDestroy {
  // TODO: Error handling

  model: FormUser;
  loading = false;
  failedRoute: string;

  submitted = false;

  constructor(public authService: AuthService, public router: Router, private route: ActivatedRoute) {
    super();
    this.model = new FormUser();
    this.addSubscription(this.route.params.subscribe(params => {
      this.failedRoute = params['failedRoute'];
    }));
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.addSubscription(this.authService.login(this.model.email, this.model.password)
      .subscribe(loggedIn => {
        if (loggedIn.data.token != null) {
          if (this.failedRoute != null) {
            this.router.navigate([this.failedRoute.replace(/,/g, '/')]);
          } else {
            this.router.navigate(['/profile']);
          }
        }
      }));
  }
}

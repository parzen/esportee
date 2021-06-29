import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormUser} from '../shared/models/form-user.model';
import {AuthService} from '../shared/services/auth.service';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'register-form',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent extends HasSubscriptions implements OnInit, OnDestroy {

  model: FormUser;
  submitted: boolean;
  loading: boolean;
  status: string;

  constructor(public authService: AuthService) {
    super();
    this.model = new FormUser();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  onSubmit() {
    // TODO: Error Handling
    this.submitted = true;
    this.loading = true;
    this.addSubscription(this.authService.register(this.model.username, this.model.email, this.model.password).subscribe(
      data => {
        if (data != null && data.data.id !== null) {
          this.status = 'Success! Please check your inbox to confirm your email address'
        } else {
          this.status = 'Failed';
        }
      },
      error => {
        this.status = 'Failed';
      },
      () => {

      }));
  }

}

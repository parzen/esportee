import {Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiClientService} from '../shared/apiclient/api-client.service';
import {IUserInfo} from '../shared/apiclient/responses/userinfo.interface';
import {StringUtils} from '../shared/utils/string.util';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.sass']
})
export class UserFormComponent extends HasSubscriptions implements OnInit, OnDestroy {
  @Input()
  user: IUserInfo;

  @Output()
  editUser: EventEmitter<IUserInfo> = new EventEmitter<IUserInfo>();

  private maxDate = new Date();
  private minDate = new Date(1900, 0, 1);
  private errors: object = {};

  userFormControl = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      StringUtils.noWhitespaceValidator
    ]),
    email: new FormControl('', [
      Validators.required,
      StringUtils.noWhitespaceValidator,
      StringUtils.emailValidator
    ])
  });

  constructor(private apiService: ApiClientService) {
    super();
  }

  ngOnInit() {
    this.errors['api_error'] = {};
    this.userFormControl.get('username').setValue(this.user.username);
    this.userFormControl.get('email').setValue(this.user.email);
    this.userFormControl.get('email').disable();
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  onEditUser(user, valid: boolean) {
    if (valid) {
      this.user.username = this.userFormControl.get('username').value;
      this.user.email = this.userFormControl.get('email').value;

      this.addSubscription(this.apiService.editUser(this.user)
        .subscribe((userData) => {
            this.editUser.emit(userData.data);
          },
          error => {
            if (this.errors['api_error'] === undefined) {
              this.errors['api_error'] = {};
            }
            this.errors['api_error']['critical'] = 'Failed to edit user';
          }));
    }
  }
}

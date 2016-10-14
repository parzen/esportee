import {Component, OnInit} from '@angular/core';
import {FormUser} from '../shared/model/FormUser';
import {UserService} from '../shared/user.service';

@Component({
  selector: 'register-form',
  templateUrl: 'register.component.html',
  styleUrls: ['register.component.sass']
})
export class RegisterComponent implements OnInit {

  model: FormUser;
  submitted: boolean;
  loading: boolean;

  constructor(public userService: UserService) {
    this.model = new FormUser();
  }

  ngOnInit() {
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.userService.register(this.model.username, this.model.email, this.model.password);
  }

}

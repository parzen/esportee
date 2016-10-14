import {Component, OnInit} from '@angular/core';
import {AngularFire} from 'angularfire2';
import {FormUser} from '../shared/model/FormUser';
import {UiErrorService} from '../shared/uierror.service';
import {UserService} from '../shared/user.service';

@Component({
    selector: 'login-form',
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.sass']
})
export class LoginComponent implements OnInit {
    // TODO: Error handling

    model:FormUser;
    loading:boolean = false;

    constructor(public af:AngularFire, public uiErrorService:UiErrorService, public userService:UserService) {
        this.model = new FormUser();
    }

    ngOnInit() {
    }

    submitted = false;

    onSubmit() {
        this.submitted = true;
        this.loading = true;
        this.userService.login(this.model.email, this.model.password);
    }
}

import {Component, OnInit} from '@angular/core';
import {LoginComponent} from '../login/login.component';
import {RegisterComponent} from '../register/register.component';
import {UserService} from '../shared/user.service';
import {ApiService} from '../shared/api.service';

@Component({
    selector: 'my-profile',
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.sass'],
    providers: [UserService]
})
export class ProfileComponent implements OnInit {

    loading:boolean;
    loggedIn:boolean;

    constructor(public userService:UserService, public apiService:ApiService) {
    }

    isLoggedIn() {
        return this.userService.isLoggedIn();
    }

    ngOnInit() {
        console.log('Hello Profile');
    }

    logOut() {
        this.userService.logout();
    }
}

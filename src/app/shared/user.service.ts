import {Injectable} from '@angular/core';
import {AngularFire, AuthProviders, AuthMethods} from 'angularfire2';
import {ApiService} from '../shared/api.service';
import {UiErrorService} from '../shared/uierror.service';
import {LoadingService} from '../shared/loading.service';

@Injectable()
export class UserService {
    loggedIn:boolean = false;
    user:UserInfo = <UserInfo>{};

    constructor(private af:AngularFire, private uiErrorService:UiErrorService, private loadingService:LoadingService, private apiService:ApiService) {
        let serviceInstance = this;
        this.af.auth.subscribe(auth => {
            this.loadingService.setLoading(false);
            if (auth != null) {
                this.loggedIn = true;
                this.user = new UserInfo(auth.auth);
                auth.auth.getToken().then(function (idToken) {
                    serviceInstance.user.idToken = idToken;
                    apiService.getProfile(serviceInstance.user.uid, idToken).subscribe(function (profile) {
                        serviceInstance.user.profile = profile;
                        console.log(JSON.stringify(serviceInstance.user));
                        if (!profile || profile.length == 0) {
                            apiService.createProfile(serviceInstance.user.uid, idToken)
                        }
                    });
                }).catch(function (error) {
                    // TODO: Logout
                });
            } else {
                this.loggedIn = false;
            }
        }, error => {
            this.loadingService.setLoading(false);
            this.loggedIn = false;
        });
    }

    getAuth() {
        return this.af.auth;
    }

    getUser():UserInfo {
        return this.user;
    }

    isLoggedIn():boolean {
        return this.loggedIn;
    }

    logout() {
        this.loadingService.setLoading(true);
        this.af.auth.logout();
    }

    login(email:string, password:string) {
        this.loadingService.setLoading(true);
        this.af.auth.login({
            email: email,
            password: password
        }, {
            method: AuthMethods.Password,
            provider: AuthProviders.Password
        }).catch(error => this.handleLoginError(error));
    }

    register(username:string, email:string, password:string) {
        this.af.auth.createUser({
            email: email,
            password: password
        }).catch(error => this.handleLoginError(error));
    }

    handleLoginError(error:Object) {
        if (error["code"] === "auth/user-not-found") {
            this.uiErrorService.setErrorMessage("Unknown email address! Create an account.");
        } else if (error["code"] === "auth/wrong-password") {
            this.uiErrorService.setErrorMessage("Wrong password.");
        } else if (error["code"] === "auth/too-many-requests") {
            this.uiErrorService.setErrorMessage("You tried too often. Please try again later.");
        } else if (error["code"] === "auth/email-already-in-use") {
            this.uiErrorService.setErrorMessage("Email already in use. Login instead!");
        } else {
            this.uiErrorService.setErrorMessage("Something went wrong [" + error["code"] + "]");
        }
    }

}

export class UserInfo {
    displayName:string;
    email:string;
    emailVerified:boolean;
    photoUrl:string;
    uid:string;
    idToken:string;
    profile: any;

    constructor(auth:any) {
        this.displayName = auth.displayName;
        this.email = auth.email;
        this.emailVerified = auth.emailVerified;
        this.photoUrl = auth.photoUrl;
        this.uid = auth.uid;
    }
}

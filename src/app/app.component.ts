import {Component} from "@angular/core"

import {ApiService} from './shared/api.service';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UserService} from "./shared/user.service";
import {UiErrorService} from "./shared/uierror.service";
import {LoadingService} from "./shared/loading.service";
import "materialize-css";
import {AngularFire} from 'angularfire2';
import {toast} from 'angular2-materialize'

/*
 * App Component
 * Top Level Component
 */


// TODO: Refactor loading indicator into service

@Component({
  selector: 'my-app', // <my-app></my-app>
  providers: [UserService, ApiService, UiErrorService, LoadingService],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.sass']
})
export class AppComponent {
  loggedIn: boolean = false;
  loading: BehaviorSubject<boolean>;

  constructor(public af: AngularFire, private api: ApiService, private uiErrorService: UiErrorService, public loadingService: LoadingService) {
    this.af.auth.subscribe(auth => {
      if (auth != null) {
        toast('AppComponent: logged in', 4000);
        console.log(auth);
        this.loggedIn = true;
      } else {
        toast('AppComponent: logged out', 4000);
        this.loggedIn = false;
      }
    }, error => {
      this.loggedIn = false;
    });

    this.loading = this.loadingService.getSubject();
  }
}

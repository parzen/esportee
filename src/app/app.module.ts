import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {Routes, RouterModule} from '@angular/router';
import {MaterialModule} from '@angular/material';
import { MaterializeModule } from 'angular2-materialize';
import "materialize-css";

import {AppComponent} from './app.component';
import {GamesComponent} from './games/games.component';
import {GamesCardComponent} from "./games-card/games-card.component";
import {HomeComponent} from "./home/home.component";
import {TournamentsComponent} from "./tournaments/tournaments.component";
import {ProfileComponent} from "./profile/profile.component";
import {StreamsComponent} from "./streams/streams.component";
import { environment } from '../environments/environment';
import { AngularFireModule } from 'angularfire2';
import {GameToCardModelPipe} from "./shared/gametocardmodel.pipe";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {TournamentFormComponent} from "./tournament-form/tournament-form.component";

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'games', component: GamesComponent},
  {path: 'tournaments', component: TournamentsComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'streams', component: StreamsComponent},
  {path: 'tournament/create/:gameName', component: TournamentFormComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    GamesComponent,
    GameToCardModelPipe,
    HomeComponent,
    TournamentsComponent,
    ProfileComponent,
    LoginComponent,
    TournamentFormComponent,
    RegisterComponent,
    StreamsComponent,
    GamesCardComponent
  ],
  imports: [
    MaterialModule.forRoot(),
    BrowserModule,
    FormsModule,
    MaterializeModule,
    RouterModule.forRoot(routes),
    HttpModule,
    AngularFireModule.initializeApp(environment.firebaseConfig)
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

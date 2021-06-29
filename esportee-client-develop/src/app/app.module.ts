import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {GamesComponent} from './games/games.component';
import {GamesCardComponent} from './games-card/games-card.component';
import {HomeComponent} from './home';
import {TournamentsListComponent} from './tournaments-list/tournaments-list.component';
import {ProfileComponent} from './profile';
import {StreamsComponent} from './streams';
import {GameToCardModelPipe} from './shared/pipes/game-to-card-model.pipe';
import {KeysPipe} from './shared/pipes/keys.pipe';
import {MatchStatusPipe} from './shared/pipes/match.pipe';
import {LoginComponent} from './login';
import {RegisterComponent} from './register';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {StageComponent} from './stage/stage.component';
import {ConfirmMailComponent} from './confirm-mail/confirm-mail.component';
import {JsonPipe} from '@angular/common';
import {AuthService} from './shared/services/auth.service';
import {ApiClientService} from './shared/apiclient/api-client.service';
import {UiErrorService} from './shared/services/ui-error.service';
import {LoadingService} from './shared/services/loading.service';
import {TournamentCreatorService} from './shared/services/tournament-creator.service';
import {LoggerService} from './shared/services/logging.service';
import {AuthGuard} from './shared/services/auth-guard.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import 'hammerjs';
import {TournamentViewComponent} from './tournament-view/tournament-view.component';
import {MatchesHistoryViewComponent} from './matches-history-view/matches-history-view.component';
import {MatchesRoundViewComponent} from './matches-round-view/matches-round-view.component';
import {MatchViewComponent} from './match-view/match-view.component';
import {MatchFormComponent} from './match-form/match-form.component';
import {StagePreviewComponent} from './stage-preview/stage-preview.component';
import {StageBracketViewComponent} from './stage-bracket-view/stage-bracket-view.component';
import {InvitationViewComponent} from './invitation-view/invitation-view.component';
import {InvitationListViewComponent} from './invitation-list-view/invitation-list-view.component';
import {InvitationFormComponent} from './invitation-form/invitation-form.component';
import {InvitationsComponent} from './invitations/invitations.component';
import {AngularFireModule} from '@angular/fire';
import {AngularFireMessagingModule} from '@angular/fire/messaging';
import {TeamFormComponent} from './team-form/team-form.component';
import {TeamViewComponent} from './team-view/team-view.component';
import {UserFormComponent} from './user-form/user-form.component';
import {ɵc} from 'angular2-prettyjson';
import './shared/rxjs-operators';
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatOptionModule,
  MatPaginatorModule,
  MatRadioModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule
} from '@angular/material';
import {TournamentFormComponent} from './tournament-form/tournament-form.component';
import {DialogAddTeamComponent} from './dialog-add-team/dialog-add-team.component';
import {DialogSelectTeamComponent} from './dialog-select-team/dialog-select-team.component';
import {DialogEditUserComponent} from './dialog-edit-user/dialog-edit-user.component';
import {DialogAddGameSettingComponent} from './dialog-add-gameSetting/dialog-add-gameSetting.component';
import {AcceptTournamentInvitationComponent} from './accept-tournament-invitation/accept-tournament-invitation.component';
import {DeclineTournamentInvitationComponent} from './decline-tournament-invitation/decline-tournament-invitation.component';
import {ParticipantCardComponent} from './participant-card/participant-card.component';
import {JwtModule} from '@auth0/angular-jwt';
import {HttpClientModule} from '@angular/common/http';
import {WebsocketService} from './shared/services/websocket.service';
import {NotificationService} from './shared/services/notification.service';
import {FirebaseMessagingService} from './shared/services/firebase-messaging.service';
import {environment} from "../environments/environment";

const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full', outlet: 'full-width-pane'},
  {path: 'games', component: GamesComponent},
  {path: 'match/:id', component: MatchViewComponent},
  {path: 'tournaments', component: TournamentsListComponent},
  {path: 'tournaments/:id', component: TournamentsListComponent},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  {path: 'signup', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'login/:failedRoute', component: LoginComponent},
  {path: 'user/:id', component: ProfileComponent},
  {path: 'streams', component: StreamsComponent},
  {path: 'tournament/create/:name', component: TournamentFormComponent, canActivate: [AuthGuard]},
  {path: 'tournament/edit/:id', component: TournamentFormComponent, canActivate: [AuthGuard]},
  {path: 'tournament/:id', component: TournamentViewComponent, canActivate: [AuthGuard]},
  {path: 'accept-invite/:token', component: AcceptTournamentInvitationComponent},
  {path: 'decline-invite/:token', component: DeclineTournamentInvitationComponent},
  {path: 'emailconfirmation', component: ConfirmMailComponent},
  {path: 'invitation/:token', component: InvitationViewComponent},
  {path: 'team/:id', component: TeamViewComponent},
  {path: '**', component: PageNotFoundComponent}
];

export function tokenGetter() {
  return localStorage.getItem('id_token');
}

@NgModule({
  declarations: [
    AppComponent,
    GamesComponent,
    GameToCardModelPipe,
    KeysPipe,
    MatchStatusPipe,
    HomeComponent,
    TournamentsListComponent,
    ProfileComponent,
    UserFormComponent,
    StageComponent,
    LoginComponent,
    TournamentFormComponent,
    TournamentViewComponent,
    RegisterComponent,
    StreamsComponent,
    GamesCardComponent,
    InvitationViewComponent,
    InvitationListViewComponent,
    InvitationFormComponent,
    InvitationsComponent,
    ConfirmMailComponent,
    MatchesHistoryViewComponent,
    MatchesRoundViewComponent,
    MatchViewComponent,
    MatchFormComponent,
    StagePreviewComponent,
    StageBracketViewComponent,
    TeamFormComponent,
    TeamViewComponent,
    PageNotFoundComponent,
    DialogAddTeamComponent,
    DialogSelectTeamComponent,
    DialogEditUserComponent,
    DialogAddGameSettingComponent,
    AcceptTournamentInvitationComponent,
    DeclineTournamentInvitationComponent,
    ParticipantCardComponent
  ],
  providers: [AuthService, NotificationService, ApiClientService, WebsocketService, UiErrorService, LoadingService,
    TournamentCreatorService, LoggerService, FirebaseMessagingService, {
      provide: JsonPipe,
      useClass: ɵc
    }, AuthGuard
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireMessagingModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatListModule,
    MatToolbarModule,
    MatInputModule,
    MatOptionModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatTabsModule,
    MatBadgeModule,
    MatMenuModule,
    MatSnackBarModule,
    MatExpansionModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:3000'],
        authScheme: 'Bearer '
      }
    })
  ],
  entryComponents: [
    StageBracketViewComponent,
    DialogAddTeamComponent,
    DialogSelectTeamComponent,
    DialogEditUserComponent,
    DialogAddGameSettingComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

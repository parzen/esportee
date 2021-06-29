import {Component, OnInit, OnDestroy} from '@angular/core';
import {AuthService} from '../shared/services/auth.service';
import {Observable} from 'rxjs';
import {IUserInfo} from '../shared/apiclient/responses/userinfo.interface';
import {ApiClientService} from '../shared/apiclient/api-client.service';
import {ITournamentConfig, MatchState, IMatch} from 'tournament-creator-ts';
import {Router, ActivatedRoute} from '@angular/router';
import {Team} from '../shared/models/team.model';
import {DialogAddTeamComponent} from '../dialog-add-team/dialog-add-team.component';
import {DialogEditUserComponent} from '../dialog-edit-user/dialog-edit-user.component';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {Action} from '../shared/models/action.model';
import {StringUtils} from '../shared/utils/string.util';
import {ParticipantStat} from '../shared/models/participantStat.model';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'my-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent extends HasSubscriptions implements OnInit, OnDestroy {

  private loading: boolean;
  private loggedIn: Observable<boolean>;
  private user: IUserInfo;
  private tournaments: ITournamentConfig[];
  private actions: Action[] = [];
  private teams: Team[];
  private matchesFinished: IMatch[];
  private participantStats: ParticipantStat[];
  private userId: string;
  private isProfile = false;

  constructor(private auth: AuthService,
              private apiService: ApiClientService,
              private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog) {
                super();
              }

  goToTournament(id: string) {
    this.router.navigate(['/tournament/' + id]);
  }

  goToTeam(id: string) {
    this.router.navigate(['/team/' + id]);
  }

  ngOnInit() {
    this.loggedIn = this.auth.loggedIn();

    if (this.router.url == '/profile') {
      this.addSubscription(this.auth.userInfo.subscribe(user => {
        this.isProfile = true;
        this.user = user;
        if (this.user != null) {
          this.userId = this.user.id.toString();
          this.getData();
        }
      }));
    } else {
      this.addSubscription(this.route.params.subscribe(params => {
        let userId = params['id'];
        if (!StringUtils.isEmpty(userId)) {
          this.addSubscription(this.apiService.getUserById(userId).subscribe(user => {
            this.user = user.data;
            this.userId = userId;
            this.getData();
          }))
        }
      }))
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  logOut() {
    this.addSubscription(this.auth.logout().subscribe());
  }

  onApproveMatchResult(matchId: string) {
    if (this.isProfile) {
      this.addSubscription(this.apiService.approveMatchResult(matchId).subscribe((match) => {
          console.log('Successfully')
        }))
    }
  }

  onDisputeMatchResult(matchId: string) {
    if (this.isProfile) {
      this.addSubscription(this.apiService.disputeMatchResult(matchId).subscribe((match) => {
          console.log('Successfully')
        }));
    }
  }

  addTeam() {
    if (this.isProfile) {
      let dialogRef = this.dialog.open(DialogAddTeamComponent);

      this.addSubscription(dialogRef.afterClosed().subscribe(result => {
        if (result != null) {
          this.teams.push(result);
        }
      }));
    }
  }

  goToTournamentList() {
    this.router.navigate(['/tournaments']);
  }

  editUser() {
    if (this.isProfile) {
      let dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        user: this.user
      };

      let dialogRef = this.dialog.open(DialogEditUserComponent, dialogConfig);

      this.addSubscription(dialogRef.afterClosed().subscribe(editedUser => {
        if (editedUser != null) {
          // this.user = editedUser;
        }
      }));
    }
  }

  getData() {
    this.addSubscription(this.apiService.getMatchesFromUser(this.userId).subscribe(matches => {
      this.matchesFinished = matches.data.filter(match => match.status === MatchState.FINISHED);

      if (this.isProfile) {
        for (let match of matches.data) {
          if (match.status === MatchState.WAITING_FOR_REPLY) {
            for (let opponent of match.opponents) {
              if (opponent.resultApprovedTimestamp == null && opponent.user.id == this.userId) {
                let action = new Action();
                action.info = 'Your approval is needed';
                action.content = StringUtils.getMatchString(match);
                action.matchId = match.id;
                this.actions.push(action);
                break;
              }
            }
          }
        }
      }
    }));

    this.addSubscription(this.apiService.getParticipantStatFromUser(this.userId)
      .subscribe(participantStats => this.participantStats = participantStats.data));

      this.addSubscription(this.apiService.getTournamentsByUserId(this.userId).subscribe(tournaments => {
      this.tournaments = tournaments.data;
    }));

    this.addSubscription(this.apiService.getTeamsByUserId(this.userId).subscribe(teams => {
      this.teams = teams.data;
    }));
  }
}

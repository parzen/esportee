import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiClientService, InvitationType} from '../shared/apiclient/api-client.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StringUtils} from '../shared/utils/string.util';
import {ITournamentConfig, TcUtils} from 'tournament-creator-ts';
import {IUserInfo} from '../shared/apiclient/responses/userinfo.interface';
import {AuthService} from '../shared/services/auth.service';
import {Game} from '../shared/models/game.model';
import {Team} from '../shared/models/team.model'
import {MatDialog, MatDialogConfig} from '@angular/material';
import {DialogSelectTeamComponent} from '../dialog-select-team/dialog-select-team.component';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'app-tournament-view',
  templateUrl: './tournament-view.component.html',
  styleUrls: ['./tournament-view.component.sass']
})
export class TournamentViewComponent extends HasSubscriptions implements OnInit, OnDestroy {
  private tournament: ITournamentConfig;
  private errors: object = {};
  private user: IUserInfo;
  private teams: Team[];
  private isAdmin = false;
  private participants: any[] = [];
  private game: Game;
  private admin: IUserInfo;
  private registrationOpen = false;
  private isAlreadyRegistered = false;
  private updatedSuccessfully = false;
  private registrationValidation = false;
  notEnoughInvitations = false;
  nrParticipantsNeeded = 0;
  nrConfirmedInvitations = 0;
  tooManyConfirmedInvitations = false;
  invitationType: InvitationType;
  invitationInfoText = '';

  constructor(private apiService: ApiClientService,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              public  dialog: MatDialog) {
    super();
    this.errors['api_error'] = {};
  }

  ngOnInit() {
    this.errors['api_error'] = {};

    this.addSubscription(this.route.params.subscribe(params => {
      let tournamentId = params['id'];
      if (!StringUtils.isEmpty(tournamentId)) {
        this.addSubscription(this.apiService.getTournament(tournamentId).subscribe(tournament => {
          this.tournament = tournament.data;
          this.tournament.stageConfigs = TcUtils.sortByKey(this.tournament.stageConfigs, 'order', 'ascending');
          this.tournament.participantStats = TcUtils.sortByKey(this.tournament.participantStats, 'rank', 'ascending');
          this.nrParticipantsNeeded = this.tournament.stageConfigs.filter(stage => stage.order === 0)[0].nrParticipants;
          this.addSubscription(this.apiService.getGameById(tournament.data.gameId).subscribe(game => {
            this.game = game.data;
          }));
          this.addSubscription(this.apiService.getUserById(this.tournament.userId).subscribe(admin => {
            this.admin = admin.data;
          }));
          this.updateParticipantList();
          this.updateRegistration();

          this.addSubscription(this.authService.userInfo.subscribe(user => {
            this.user = user;
            if (user) {
              this.isAdmin = this.tournament.userId === this.user.id;

              if (this.tournament.isATeamTournament) {
                this.addSubscription(this.apiService.getTeamsByUser().subscribe(teams => {
                  this.teams = teams.data;

                  if (this.tournament.status === 'pending') {
                    for (let team of this.teams) {
                      this.addSubscription(this.apiService.isTeamRegisteredForTournament(this.tournament.id, team.id.toString())
                        .subscribe(result => {
                          if (result.data === true) {
                            this.isAlreadyRegistered = true;
                          }
                          this.registrationValidation = true;
                          this.updateRegistration();
                        }));
                    }
                  }
                }));
              } else {
                if (this.tournament.status === 'pending') {
                  this.addSubscription(this.apiService.isUserRegisteredForTournament(this.tournament.id, this.user.id.toString()).subscribe(result => {
                    this.isAlreadyRegistered = result.data;
                    this.registrationValidation = true;
                    this.updateRegistration();
                  }));
                }
              }
            }
          }));

          if (this.tournament.isATeamTournament) {
            this.invitationType = InvitationType.ADD_TEAM_TOURNAMENT;
          } else {
            this.invitationType = InvitationType.ADD_USER_TOURNAMENT;
          }
        }, error => {
          this.errors['api_error']['critical'] = 'Failed to load tournament';
        }));
      }
    }));
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  onRegisterForTournament() {
    if (this.tournament.isATeamTournament) {

      if (this.teams.length === 1) {
        this.createTeamRegisterInvitation(this.teams[0].id);
      } else if (this.teams.length > 1) {
        let teamnames: string[] = [];
        for (let team of this.teams) {
          teamnames.push(team.name);
        }

        let dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          teamnames: teamnames
        };

        let dialogRef = this.dialog.open(DialogSelectTeamComponent, dialogConfig);

        this.addSubscription(dialogRef.afterClosed().subscribe((selectedTeamname: string) => {
          if (selectedTeamname) {
            for (let team of this.teams) {
              if (team.name === selectedTeamname) {
                this.createTeamRegisterInvitation(team.id);
                break;
              }
            }
          }
        }));
      }
    } else {
      this.addSubscription(this.apiService.createInvitation(null, this.user.id, null, null, this.tournament.id, InvitationType.REGISTER_USER_TOURNAMENT)
        .subscribe((invitation) => {
            this.isAlreadyRegistered = true;
            this.setUpdatedSuccessfully();
            this.updateRegistration();
          },
          error => {
            if (this.errors['api_error'] === undefined) {
              this.errors['api_error'] = {};
            }
            this.errors['api_error']['critical'] = 'Failed to create invitation';
          }));
    }
  }

  createTeamRegisterInvitation(selectedTeamId: number) {
    this.addSubscription(this.apiService.createInvitation(null, null, null, selectedTeamId, this.tournament.id, InvitationType.REGISTER_TEAM_TOURNAMENT)
      .subscribe((invitation) => {
          this.isAlreadyRegistered = true;
          this.setUpdatedSuccessfully();
          this.updateRegistration();
        },
        error => {
          if (this.errors['api_error'] === undefined) {
            this.errors['api_error'] = {};
          }
          this.errors['api_error']['critical'] = 'Failed to create invitation';
        }));
  }

  onStartTournamentButton() {
    if (this.nrConfirmedInvitations < this.nrParticipantsNeeded) {
      this.notEnoughInvitations = true;
    } else if (this.nrConfirmedInvitations > this.nrParticipantsNeeded) {
      this.errors['api_error']['critical'] = 'To many invitations. Please delete ' +
        (this.nrConfirmedInvitations - this.nrParticipantsNeeded + ' invitation.');
    }
  }

  onDecline() {
    this.notEnoughInvitations = false;
  }

  startTournament() {
    this.addSubscription(this.apiService.startTournament(this.tournament.id.toString())
      .subscribe((success) => {
          if (success.data === true) {
            this.addSubscription(this.apiService.getTournament(this.tournament.id.toString()).subscribe(tournament => {
              this.tournament = tournament.data;
              this.tournament.stageConfigs = TcUtils.sortByKey(this.tournament.stageConfigs, 'order', 'ascending');
              this.updateParticipantList();
              this.updateRegistration();
            }, error => {
              this.errors['api_error']['critical'] = 'Failed to load tournament';
            }));
          }
        },
        error => {
          if (this.errors['api_error'] === undefined) {
            this.errors['api_error'] = {};
          }
          this.errors['api_error']['critical'] = 'Failed to start tournament';
        }));
  }

  onUpdateNrConfirmedInvitation(nrConfirmedInvitations: number) {
    this.nrConfirmedInvitations = nrConfirmedInvitations;
    this.tooManyConfirmedInvitations = this.nrConfirmedInvitations > this.nrParticipantsNeeded;

    if (this.tooManyConfirmedInvitations) {
      this.invitationInfoText = 'Too many confirmed invitations! Please delete '
        + (this.nrConfirmedInvitations - this.nrParticipantsNeeded) + ' confirmed invitation!';
    } else {
      this.invitationInfoText = (this.nrParticipantsNeeded - this.nrConfirmedInvitations) + ' confirmed invitations left';
    }
  }

  goToUser(id: string) {
    this.router.navigate(['/user/' + id]);
  }

  updateParticipantList() {
    if (this.tournament.status !== 'pending') {
      this.participants = [];
      let participantsIds: number[] = [];
      for (let match of this.tournament.stageConfigs.filter(stage => stage.order === 0)[0].matches) {
        for (let opponent of match.opponents) {
          if (!opponent.user && !opponent.team) {
            continue;
          }

          let participant = opponent.user ? opponent.user : opponent.team;
          if (participantsIds.indexOf(participant.id) < 0) {
            participantsIds.push(participant.id);
            this.participants.push(participant);
          }
        }
      }
    } else {
      // TODO: get participant list from invitations
    }
  }

  updateRegistration() {
    this.registrationOpen = false;
    if (this.tournament.status === 'pending' && !this.isAlreadyRegistered && this.registrationValidation) {
      let today = new Date();
      let start = new Date(this.tournament.checkinDateStart);
      let end = new Date(this.tournament.checkinDateEnd);
      if (start <= today && today <= end) {
        this.registrationOpen = true;
      }
    }
  }

  setUpdatedSuccessfully() {
    this.updatedSuccessfully = true;
    setTimeout(function () {
      this.updatedSuccessfully = false;
    }.bind(this), 3000);
  }

  onEditTournament() {
    if (this.isAdmin) {
      this.router.navigate(['/tournament/edit/' + this.tournament.id]);
    }
  }
}

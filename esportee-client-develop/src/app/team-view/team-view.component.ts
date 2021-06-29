import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiClientService, InvitationType} from '../shared/apiclient/api-client.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StringUtils} from '../shared/utils/string.util';
import {TeamUtils} from '../shared/utils/team.util';
import {Team, Teammember} from '../shared/models/team.model';
import {FormControl, Validators} from '@angular/forms';
import {IUserInfo} from '../shared/apiclient/responses/userinfo.interface';
import {AuthService} from '../shared/services/auth.service';
import {TcUtils} from 'tournament-creator-ts';
import {ParticipantStat} from '../shared/models/participantStat.model';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.sass']
})
export class TeamViewComponent extends HasSubscriptions implements OnInit, OnDestroy {
  private team: Team;
  private activeMembers: Teammember[];
  private formerMembers: Teammember[];
  private errors: object = {};
  private updatedSuccessfully = false;
  private editing = false;
  private user: IUserInfo;
  private isAdmin = false;
  private participantStats: ParticipantStat[];
  invitationType: InvitationType;
  teamNameFormControl = new FormControl('', [
    Validators.required,
    StringUtils.noWhitespaceValidator]);

  constructor(private apiService: ApiClientService,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService) {
    super();
    this.errors['api_error'] = {};
  }

  ngOnInit() {
    this.errors['api_error'] = {};
    this.addSubscription(this.route.params.subscribe(params => {
      let teamId = params['id'];
      if (!StringUtils.isEmpty(teamId)) {
        this.addSubscription(this.apiService.getTeamById(teamId).subscribe(team => {
          this.activeMembers = TeamUtils.getActiveMembers(team.data);
          this.formerMembers = TeamUtils.getFormerMembers(team.data);
          this.team = team.data;
          this.invitationType = InvitationType.JOIN_TEAM;

          this.addSubscription(this.apiService.getParticipantStatFromTeam(teamId)
            .subscribe(participantStats => {
              this.participantStats = TcUtils.sortByKey(participantStats.data, 'rank', 'ascending');
            }));

          this.addSubscription(this.authService.userInfo.subscribe(user => {
            this.user = user;
            if (user) {
              this.isAdmin = TeamUtils.isTeamAdmin(team.data, user.id);
            }
            }));
        }, error => {
          this.errors['api_error']['critical'] = 'Failed to load team';
        }));
      }
    }));
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  goToUser(id: string) {
    this.router.navigate(['/user/' + id]);
  }

  onRemove(teammemberId: number) {
    this.addSubscription(this.apiService.deleteTeammember(teammemberId)
      .subscribe((returnValue) => {
          let formerMember = this.activeMembers.filter(teammember => teammember.id === teammemberId)[0];
          this.formerMembers.push(formerMember);

          this.activeMembers = this.activeMembers.filter(teammember => teammember.id !== teammemberId);
        },
        error => {
          if (this.errors['api_error'] === undefined) {
            this.errors['api_error'] = {};
          }
          this.errors['api_error']['critical'] = 'Failed to delete teammember';
        }));
  }

  onEditing() {
    this.editing = true;
    this.teamNameFormControl.setValue(this.team.name);
  }

  onBack() {
    this.editing = false;
    this.teamNameFormControl.markAsPristine();
    this.teamNameFormControl.markAsUntouched();
    this.teamNameFormControl.markAsPending();
  }

  onUpdateTeamName(teamname: string, valid: boolean) {
    if (valid) {
      this.addSubscription(this.apiService.updateTeam(this.team.id, teamname).subscribe((returnvalue) => {
          if (returnvalue.data === true) {
            this.team.name = teamname;
            this.onBack();
          }
        },
        error => {
          if (this.errors['api_error'] === undefined) {
            this.errors['api_error'] = {};
          }
          this.errors['api_error']['critical'] = 'Failed to update team name, perhaps team name is already given!';
        }));
    }
  }

  sendRejoinInvitation(teammember: Teammember) {
    this.addSubscription(this.apiService.createInvitation(null, teammember.user.id, null, this.team.id, null, InvitationType.JOIN_TEAM)
      .subscribe((invitation) => {
          this.updatedSuccessfully = true;
          // wait 3 Seconds and hide
          setTimeout(function () {
            this.updatedSuccessfully = false;
          }.bind(this), 3000);
        },
        error => {
          if (this.errors['api_error'] === undefined) {
            this.errors['api_error'] = {};
          }
          this.errors['api_error']['critical'] = 'Failed to create invitation';
        }));
  }
}

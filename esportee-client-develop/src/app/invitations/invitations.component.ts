import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ApiClientService, InvitationType} from '../shared/apiclient/api-client.service';
import {Invitation} from '../shared/apiclient/responses/invitation.interface';
import {InvitationCreate} from '../shared/models/invitation-create.model'
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.sass']
})
export class InvitationsComponent extends HasSubscriptions implements OnInit, OnDestroy {
  private errors: object = {};
  invitationList: Invitation[] = [];
  nrInvitations = 0;
  lastInvitationTokenSaved: string;

  @Input()
  tournamentId: number;

  @Input()
  teamId: number;

  @Input()
  invitationType: InvitationType;

  @Output()
  updateNrConfirmedInvitations: EventEmitter<number> = new EventEmitter<number>();

  constructor(private apiService: ApiClientService) {
    super();
    this.errors['api_error'] = {};
  }

  ngOnInit() {
    this.errors['api_error'] = {};

    if (this.invitationType === InvitationType.ADD_TEAM_TOURNAMENT || this.invitationType === InvitationType.ADD_USER_TOURNAMENT) {
      this.addSubscription(this.apiService.getInvitationsByTournament('' + this.tournamentId)
        .subscribe(invitations => {
          this.invitationList = invitations.data;
          this.updateInvitationParams();
        }));
    } else if (this.invitationType === InvitationType.JOIN_TEAM) {
      this.addSubscription(this.apiService.getInvitationsByTeam('' + this.teamId)
        .subscribe(invitations => {
          this.invitationList = invitations.data;
          this.updateInvitationParams();
        }));
    } else {
      this.errors['api_error']['critical'] = 'Unknown invitation type!';
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  onCreateInvitation(result: InvitationCreate) {
    this.addSubscription(this.apiService.createInvitation(result.email ? result.email : null, null,
      result.teamname ? result.teamname : null, this.teamId, this.tournamentId, this.invitationType)
      .subscribe(invitation => {
          this.invitationList.push(invitation.data);
          this.updateInvitationParams();
          this.lastInvitationTokenSaved = invitation.data.token;
        },
        error => {
          if (this.errors['api_error'] === undefined) {
            this.errors['api_error'] = {};
          }
          this.errors['api_error']['critical'] = 'Failed to create invitation';
        }));
  }

  onInvitationRemove(invitation: Invitation) {
    this.addSubscription(this.apiService.deleteInvitation(invitation.token)
      .subscribe(returnValue => {
          this.invitationList = this.invitationList.filter((item: Invitation) => {
            return item.token !== invitation.token;
          });
          this.updateInvitationParams();
        },
        error => {
          if (this.errors['api_error'] === undefined) {
            this.errors['api_error'] = {};
          }
          this.errors['api_error']['critical'] = 'Failed to delete invitation';
        }));
  }

  updateInvitationParams() {
    this.nrInvitations = this.invitationList.length;
    let nrConfirmedInvitations = this.invitationList.filter(invitation => invitation.status === 'confirmed').length;
    this.updateNrConfirmedInvitations.emit(nrConfirmedInvitations);
  }
}

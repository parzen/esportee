import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Invitation} from '../shared/apiclient/responses/invitation.interface';
import {InvitationType} from '../shared/apiclient/api-client.service';

@Component({
  selector: 'invitation-list-view',
  templateUrl: './invitation-list-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./invitation-list-view.component.sass']
})
export class InvitationListViewComponent implements OnChanges {
  @Input()
  invitationList: Invitation[] = [];

  @Input()
  nrInvitations = 0; // This is just to trigger ngOnChanges

  @Output()
  remove: EventEmitter<Invitation> = new EventEmitter<Invitation>();

  private confirmedInvitations: Invitation[] = [];
  private declinedInvitations: Invitation[] = [];
  private openInvitations: Invitation[] = [];
  private openRegistrations: Invitation[] = [];

  constructor() {
  }

  ngOnChanges() {
    this.confirmedInvitations = this.invitationList.filter(invitation => invitation.status === 'confirmed');
    this.declinedInvitations = this.invitationList.filter(invitation => invitation.status === 'declined');
    this.openInvitations = this.invitationList.filter(invitation => invitation.status === 'pending' &&
      (invitation.type === InvitationType.ADD_TEAM_TOURNAMENT || invitation.type === InvitationType.ADD_USER_TOURNAMENT ||
        invitation.type === InvitationType.JOIN_TEAM));
    this.openRegistrations = this.invitationList.filter(invitation => invitation.status === 'pending' &&
      (invitation.type === InvitationType.REGISTER_TEAM_TOURNAMENT || invitation.type === InvitationType.REGISTER_USER_TOURNAMENT));
  }

  onRemove(invitation: Invitation) {
    this.remove.emit(invitation);
  }
}

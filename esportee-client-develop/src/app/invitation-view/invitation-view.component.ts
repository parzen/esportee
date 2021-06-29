import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiClientService, InvitationType} from '../shared/apiclient/api-client.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StringUtils} from '../shared/utils/string.util';
import {Invitation} from '../shared/apiclient/responses/invitation.interface'
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'invitation-view',
  templateUrl: './invitation-view.component.html',
  styleUrls: ['./invitation-view.component.sass']
})
export class InvitationViewComponent extends HasSubscriptions implements OnInit, OnDestroy {
  private errors: object = {};
  updatedSuccessfully = false;
  invitation: Invitation;
  question = '';

  constructor(
    private apiService: ApiClientService,
    private route: ActivatedRoute) {
      super();
      this.errors['api_error'] = {};
  }

  ngOnInit() {
    this.addSubscription(this.route.params.subscribe(params => {
      let token = params['token'];
      if (!StringUtils.isEmpty(token)) {
        this.addSubscription(this.apiService.getInvitation(token).subscribe(invitation => {
          this.invitation = invitation.data;

          switch (this.invitation.type) {
            case InvitationType.ADD_TEAM_TOURNAMENT:
            case InvitationType.ADD_USER_TOURNAMENT:
              this.question = 'Do you want to participate to this tournament?';
              break;
            case InvitationType.JOIN_TEAM:
              this.question = 'Do you want to join this team?';
              break;
            case InvitationType.REGISTER_TEAM_TOURNAMENT:
            case InvitationType.REGISTER_USER_TOURNAMENT:
              this.question = 'Do you want to confirm this registration?';
              break;
            default:
              this.question = 'Unknown type';
              break;
          }
        }, error => {
          console.log('Error: Server returned with error');
          // this.router.navigate(['404']);
        }));
      } else {
        console.log('Error: Server returned with error');
        // this.router.navigate(['404']);
      }
    }));
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  onConfirm() {
    this.onUpdate('confirmed');
  }

  onDecline() {
    this.onUpdate('declined');
  }

  onUpdate(status: string) {
    this.addSubscription(this.apiService.updateInvitation(this.invitation.token, status)
      .subscribe(returnValue => {
        this.updatedSuccessfully = returnValue.data;
        this.invitation.status = status;

        setTimeout(function () {
          this.updatedSuccessfully = false;
        }.bind(this), 3000);
      },
      error => {
        if (this.errors['api_error'] === undefined) {
          this.errors['api_error'] = {};
        }
        this.errors['api_error']['critical'] = 'Failed to update invitation';
      }));
  }

  onChangeOpinion() {
    this.updatedSuccessfully = false;
    this.invitation.status = 'pending';
  }
}

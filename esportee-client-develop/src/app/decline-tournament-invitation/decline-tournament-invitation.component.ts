import {Component, OnInit, OnDestroy} from '@angular/core';
import {ApiClientService} from '../shared/apiclient/api-client.service';
import {ActivatedRoute} from '@angular/router';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'app-decline-tournament-invitation',
  templateUrl: './decline-tournament-invitation.component.html',
  styleUrls: ['./decline-tournament-invitation.component.sass']
})
export class DeclineTournamentInvitationComponent extends HasSubscriptions implements OnInit, OnDestroy {

  constructor(private apiService: ApiClientService, private route: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.addSubscription(this.route.params.subscribe(params => {
      let invitationToken = params['token'];
      console.log(invitationToken);
      if (invitationToken != null) {
        this.addSubscription(this.apiService.declineInvitation(invitationToken)
          .subscribe(success => {
            console.log(success + 'success');
          }, error => {
            // TODO: display error
          }));
      } else {
        // TODO: show error
      }
    }));
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }
}

import {Component, OnInit, OnDestroy} from '@angular/core';
import {ApiClientService} from '../shared/apiclient/api-client.service';
import {ActivatedRoute} from '@angular/router';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'app-accept-tournament-invitation',
  templateUrl: './accept-tournament-invitation.component.html',
  styleUrls: ['./accept-tournament-invitation.component.sass']
})
export class AcceptTournamentInvitationComponent extends HasSubscriptions implements OnDestroy, OnInit {

  constructor(private apiService: ApiClientService, private route: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.addSubscription(this.route.params.subscribe(params => {
      let invitationToken = params['token'];
      console.log(invitationToken);
      if (invitationToken != null) {
        this.addSubscription(this.apiService.acceptInvitation(invitationToken)
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

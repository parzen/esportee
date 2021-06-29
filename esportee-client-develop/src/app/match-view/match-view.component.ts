import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiClientService} from '../shared/apiclient/api-client.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StringUtils} from '../shared/utils/string.util';
import {IMatch} from 'tournament-creator-ts';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'match-view',
  templateUrl: './match-view.component.html',
  styleUrls: ['./match-view.component.sass']
})
export class MatchViewComponent extends HasSubscriptions implements OnInit, OnDestroy {
  private match: IMatch;
  private errors: object = {};
  private updatedSuccessfully = false;

  constructor(private apiService: ApiClientService,
              private route: ActivatedRoute,
              private router: Router) {
    super();
    this.errors['api_error'] = {};
  }

  ngOnInit() {
    this.errors['api_error'] = {};
    this.addSubscription(this.route.params.subscribe(params => {
      let matchId = params['id'];
      if (!StringUtils.isEmpty(matchId)) {
        this.addSubscription(this.apiService.getMatch(matchId).subscribe(match => {
          this.match = match.data;
          this.sortByAdvantage();
        }, error => {
          this.errors['api_error']['critical'] = 'Failed to load tournament';
        }));
      }
    }));
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  onApprove(matchId: string) {
    this.errors['api_error'] = {};
    this.addSubscription(this.apiService.approveMatchResult(matchId).subscribe((match) => {
        this.match = match.data;
        this.sortByAdvantage();
        this.setUpdatedSuccessfully();
      }, error => {
        this.errors['api_error']['critical'] = 'Failed to approve result';
      }));
  }

  onApproveAndBack(matchId: string) {
    this.errors['api_error'] = {};
    this.addSubscription(this.apiService.approveMatchResult(matchId).subscribe((match) => {
        this.onBack(match.data);
      }, error => {
        this.errors['api_error']['critical'] = 'Failed to approve result';
      }));
  }

  onUpdate(event: IMatch) {
    this.errors['api_error'] = {};
    this.addSubscription(this.apiService.submitMatchResult(event).subscribe((match) => {
        this.match = match.data;
        this.sortByAdvantage();
        this.setUpdatedSuccessfully();
      }, error => {
        this.errors['api_error']['critical'] = 'Failed to update match';
      }));
  }

  onUpdateAndBack(event: IMatch) {
    this.errors['api_error'] = {};
    this.addSubscription(this.apiService.submitMatchResult(event).subscribe((match) => {
        this.onBack(match.data);
      }, error => {
        this.errors['api_error']['critical'] = 'Failed to update match';
      }));
  }

  onBack(event: IMatch) {
    this.router.navigate(['/tournament', this.match.stage.config.id]);
  }

  onDispute(matchId: string) {
    this.errors['api_error'] = {};
    this.addSubscription(this.apiService.disputeMatchResult(matchId).subscribe((match) => {
        this.match = match.data;
        this.sortByAdvantage();
        this.setUpdatedSuccessfully();
      }, error => {
        this.errors['api_error']['critical'] = 'Failed to dispute match';
      }));
  }

  sortByAdvantage() {
    if (this.match.opponents) {
      this.match.opponents = this.match.opponents.sort(function (a, b) {
        let x = a['advantage'];
        let y = b['advantage'];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
      });
    }
  };

  setUpdatedSuccessfully() {
    this.updatedSuccessfully = true;
    setTimeout(function () {
      this.updatedSuccessfully = false;
    }.bind(this), 3000);
  }
}

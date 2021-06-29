import {Component, OnInit, OnDestroy} from '@angular/core';
import {Game} from '../shared/models/game.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {LoadingService} from '../shared/services/loading.service';
import {ApiClientService} from '../shared/apiclient/api-client.service';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'my-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.sass']
})
export class GamesComponent extends HasSubscriptions implements OnInit, OnDestroy {

  games: Game[];
  errorMessage: string;
  loading: BehaviorSubject<boolean>;

  constructor(private api: ApiClientService, private loadingService: LoadingService) {
    super();
    this.loading = this.loadingService.getSubject();
  }

  ngOnInit() {
    this.getGames();
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  private getGames() {
    this.addSubscription(this.api.getGames().subscribe(response => {
      this.games = response.data;
    }, error => {
      this.errorMessage = <any>error;
    }));
  }
}

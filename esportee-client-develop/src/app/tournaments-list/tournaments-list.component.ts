import {Component, OnInit, OnDestroy} from '@angular/core';
import {ApiClientService} from '../shared/apiclient/api-client.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StringUtils} from '../shared/utils/string.util';
import {ITournamentConfig} from 'tournament-creator-ts';
import {Game} from '../shared/models/game.model';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'tournaments-list',
  templateUrl: './tournaments-list.component.html',
  styleUrls: ['./tournaments-list.component.sass']
})
export class TournamentsListComponent extends HasSubscriptions implements OnInit, OnDestroy {
  private tournaments: ITournamentConfig[];
  private game: Game;
  private gameId: string;
  private games: Game[];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private apiService: ApiClientService) {
    super();
  }

  ngOnInit() {
    this.addSubscription(this.route.params.subscribe(params => {
      this.gameId = params['id'];
      if (!StringUtils.isEmpty(this.gameId)) {
        if (StringUtils.isNumeric(this.gameId)) {
          this.addSubscription(this.apiService.getGameById(this.gameId).subscribe(game => {
            this.game = game.data;
          }, error => {
            console.log(error)
          }));
          this.addSubscription(this.apiService.getTournamentsForGame(this.gameId).subscribe(tournaments => {
            this.tournaments = tournaments.data;
            console.log(this.tournaments);
          }, error => {
            console.log(error)
          }));
        } else {
          // gameId can also be game.urlParam (fifa16)
          this.addSubscription(this.apiService.getGame(this.gameId).subscribe(game => {
            this.game = game.data;

            this.addSubscription(this.apiService.getTournamentsForGame(this.game.id.toString()).subscribe(tournaments => {
              this.tournaments = tournaments.data;
            }, error => {
              console.log(error)
            }));
          }, error => {
            console.log(error)
          }));
        }
      } else {
        this.addSubscription(this.apiService.getGames().subscribe(games => {
          this.games = games.data;
        }, error => {
          console.log(error);
        }));
      }
    }));
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  goToTournament(id: string) {
    this.router.navigate(['/tournament/' + id]);
  }
}

import {Component, OnInit, Input} from '@angular/core';
import {Router} from '@angular/router';
import {Game} from '../shared/models/game.model';

@Component({
  selector: 'my-games-card',
  templateUrl: './games-card.component.html',
  styleUrls: ['./games-card.component.sass']
})
export class GamesCardComponent implements OnInit {
  @Input() model: Game;
  @Input() toCreate: boolean;

  constructor(private router: Router) {
  }

  createTournament() {
    this.router.navigate(['/tournament/create', this.model.urlParam]);
  }

  navigateToTournaments() {
    this.router.navigate(['/tournaments', this.model.urlParam]);
  }

  ngOnInit() {
  }

}

import {Component, Input, OnInit} from '@angular/core';
import {IMatch, TcUtils} from 'tournament-creator-ts';

@Component({
  selector: 'matches-history-view',
  templateUrl: './matches-history-view.component.html',
  styleUrls: ['./matches-history-view.component.sass']
})
export class MatchesHistoryViewComponent implements OnInit {
  @Input()
  matches: IMatch[];

  constructor() {
  }

  ngOnInit() {
    this.matches.forEach(match => {
      match.maxTimestamp = match.opponents[0].resultApprovedTimestamp > match.opponents[1].resultApprovedTimestamp
        ? match.opponents[0].resultApprovedTimestamp : match.opponents[1].resultApprovedTimestamp;
      TcUtils.sortByKey(match.opponents, 'advantage', 'descending');
    });
    this.matches = TcUtils.sortByKey(this.matches, 'maxTimestamp', 'descending');

    // Cut out last 10 matches
    this.matches = this.matches.splice(0, 10);
  }
}

import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {IMatch, MatchFactory, MatchState, sortRule, tableEntry, TcUtils} from 'tournament-creator-ts';

@Component({
  selector: 'stage-bracket-view',
  templateUrl: './stage-bracket-view.component.html',
  styleUrls: ['./stage-bracket-view.component.sass']
})
export class StageBracketViewComponent implements OnInit, OnChanges {
  @Input() matches: IMatch[];
  @Input() id: number;
  @Input() isATeamTournament: boolean;
  sortedTable: tableEntry[];
  title = '';

  public MatchState = MatchState;
  public Emptytoken = MatchFactory.EMPTY_ENTRY.token;

  constructor() {
  }

  ngOnChanges() {
  }

  ngOnInit() {
    const sortRules: sortRule[] = [
      {pos: 0, rule: 'points'},
      {pos: 1, rule: 'difference'},
      {pos: 2, rule: 'for'},
      {pos: 3, rule: 'points hth'},
      {pos: 4, rule: 'difference hth'},
      {pos: 5, rule: 'for hth'},
      {pos: 6, rule: 'random'}
    ];

    this.matches = TcUtils.sortByKey(this.matches, 'round', 'ascending');
    this.sortedTable = TcUtils.getSortedTable(this.matches, sortRules, this.id);
  }

}

import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {ITournamentConfig, MatchFactory, MatchState, TcUtils} from 'tournament-creator-ts';
import {IUserInfo} from '../shared/apiclient/responses/userinfo.interface'
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {Team} from '../shared/models/team.model';
import { StringUtils } from '../shared/utils/string.util';

@Component({
  selector: 'matches-round-view',
  templateUrl: './matches-round-view.component.html',
  styleUrls: ['./matches-round-view.component.sass']
})
export class MatchesRoundViewComponent implements OnInit, OnChanges {
  @Input()
  tournament: ITournamentConfig;

  @Input()
  user: IUserInfo;

  @Input()
  participants: any[];

  @Input()
  activeInThisTeams: Team[];

  displayedColumns: string[] = ['venue', 'group', 'vs', 'status'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  currentRound = -1;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.updateData();
  }

  ngOnChanges() {
    this.updateData();
  }

  updateData() {
    let matches: PeriodicElement[] = [];
    let highlightId = -1;
    this.currentRound = -1;

    if (this.tournament.type === 'online') {
      this.displayedColumns = ['group', 'vs', 'status'];
    }

    if (this.tournament.isATeamTournament && this.activeInThisTeams) {
      for (let team of this.participants) {
        let foundTeam = this.activeInThisTeams.filter(t => t.id === team.id)[0];
        if (foundTeam) {
          highlightId = team.id;
          break;
        }
      }
    } else {
      highlightId = this.user.id;
    }

    let stageConfigsAsc = TcUtils.sortByKey(this.tournament.stageConfigs, 'order', 'ascending');
    for (let stage of stageConfigsAsc) {
      let maxPhase = Math.max.apply(Math, stage.matches.map(match => match.phase));

      for (let phase = 0; phase <= maxPhase; phase++) {
        let matchesPhase = stage.matches.filter(match => match.phase === phase);

        if (!TcUtils.allFinished(matchesPhase)) {
          let maxRound = Math.max.apply(Math, matchesPhase.map(match => match.round));

          for (let round = 0; round <= maxRound; round++) {
            let matchesRound = matchesPhase.filter(match => match.round === round);

            if (!TcUtils.allFinished(matchesRound)) {
              this.currentRound = round;

              for (let match of matchesRound) {
                if (match.status === MatchState.WILDCARD) {
                  continue;
                }

                let element: PeriodicElement = {
                  matchId: match.id,
                  bracket: match.bracket,
                  venue: match.venue,
                  status: match.status,
                  vs: StringUtils.getMatchString(match),
                  highlight: false
                };

                for (let i = 0; i < match.opponents.length; i++) {
                  let opponent = match.opponents[i];
                  if (opponent.user) {
                    if (opponent.user.id === highlightId) {
                      element.highlight = true;
                      break;
                    }
                  } else if (opponent.team) {
                    if (opponent.team.id === highlightId) {
                      element.highlight = true;
                      break;
                    }
                  }
                }

                matches.push(element);
              }
            }
            if (this.currentRound > -1) {
              break;
            }
          }
        }
        if (this.currentRound > -1) {
          break;
        }
      }
      if (this.currentRound > -1) {
        break;
      }
    }

    this.dataSource.data = matches;
  }
}

export interface PeriodicElement {
  matchId: number;
  vs: string;
  venue: number;
  bracket: number;
  status: number;
  highlight: boolean;
}

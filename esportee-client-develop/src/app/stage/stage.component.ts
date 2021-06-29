import {
  Component,
  ComponentFactoryResolver,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {IStageConfig, sortRule, StageType, tableEntry, TcUtils} from 'tournament-creator-ts';

import {StageBracketViewComponent} from '../stage-bracket-view/stage-bracket-view.component';

@Component({
  selector: 'app-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.sass']
})
export class StageComponent implements OnInit, OnChanges {
  @Input() stage: IStageConfig;
  @Input() isATeamTournament: boolean;

  @ViewChild('entry', {read: ViewContainerRef}) entry: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {
  }

  ngOnChanges() {
    if (this.stage.stageType === StageType.GROUP) {
      for (let bracket = 0; bracket < this.stage.nrGroups; bracket++) {
        const stageBracketFactory = this.resolver.resolveComponentFactory(StageBracketViewComponent);
        const component = this.entry.createComponent(stageBracketFactory);
        component.instance.id = this.stage.id;

        component.instance.isATeamTournament = this.isATeamTournament;
        component.instance.title = 'Group ' + (bracket + 1);
        component.instance.matches = this.stage.matches.filter((item) => item.bracket === bracket);
      }
    } else if (this.stage.stageType === StageType.SINGLE_ELIMINATION) {
      let maxPhase = Math.max.apply(Math, this.stage.matches.map(match => match.phase));
      for (let phase = 0; phase <= maxPhase; phase++) {
        let matches = this.stage.matches.filter((item) => item.phase === phase);
        let maxBracket = Math.max.apply(Math, matches.map(match => match.bracket));
        let title = TcUtils.getSeTitle(maxPhase, phase, this.stage.thirdPlaceMatch);

        for (let bracket = 0; bracket <= maxBracket; bracket++) {
          const stageBracketFactory = this.resolver.resolveComponentFactory(StageBracketViewComponent);
          const component = this.entry.createComponent(stageBracketFactory);
          component.instance.id = this.stage.id;

          component.instance.isATeamTournament = this.isATeamTournament;
          component.instance.title = title;
          component.instance.matches = matches.filter((item) => item.bracket === bracket);
        }
      }
    }
  }

  ngOnInit() {
  }
}

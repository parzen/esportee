import {Component, DoCheck, Input, OnChanges, OnInit} from '@angular/core';
import {IStageConfig, MatchFactory, previewArray, StageType} from 'tournament-creator-ts';

@Component({
  selector: 'stage-preview',
  templateUrl: './stage-preview.component.html',
  styleUrls: ['./stage-preview.component.sass']
})
export class StagePreviewComponent implements OnInit, OnChanges, DoCheck {
  @Input()
  stage: IStageConfig;

  previewArray: previewArray[];
  nrMatches: 0;

  constructor() {
  }

  ngOnInit() {
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  ngDoCheck() {
    // TODO: add own decision logic if something changed
    this.update();
  }

  update() {
    this.previewArray = this.stage.getPreviewArray(true);
    if (this.stage.stageType === StageType.GROUP) {
      this.nrMatches = this.stage.matches
        .filter(match => (match.opponents.filter(opponent => opponent.token !== MatchFactory.EMPTY_ENTRY.token)
          .length > 1)).length;
    } else {
      this.nrMatches = this.stage.matches.length;
    }
  }
}

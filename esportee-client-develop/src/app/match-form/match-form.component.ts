import {Component, EventEmitter, Input, Output, OnChanges} from '@angular/core';

import {IMatch, MatchState} from 'tournament-creator-ts';

@Component({
  selector: 'match-form',
  templateUrl: './match-form.component.html',
  styleUrls: ['./match-form.component.sass']
})
export class MatchFormComponent implements OnChanges {
  private allParticipantsPresent = false;
  public MatchState = MatchState;

  @Input()
  match: IMatch;

  @Input()
  updatedSuccessfully: boolean;

  @Output()
  approve: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  approveAndBack: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  update: EventEmitter<IMatch> = new EventEmitter<IMatch>();

  @Output()
  updateAndBack: EventEmitter<IMatch> = new EventEmitter<IMatch>();

  @Output()
  back: EventEmitter<IMatch> = new EventEmitter<IMatch>();

  @Output()
  dispute: EventEmitter<IMatch> = new EventEmitter<IMatch>();

  errors: string[] = [];
  nrErrors = 0;

  constructor() {
  }

  handleApprove() {
    this.approve.emit(this.match.id);
  }

  handleApproveAndBack() {
    if (this.nrErrors === 0) {
      this.approveAndBack.emit(this.match.id);
    }
  }

  handleSubmit() {
    if (this.nrErrors === 0) {
      this.update.emit(this.match);
    }
  }

  handleSubmitAndBack() {
    if (this.nrErrors === 0) {
      this.updateAndBack.emit(this.match);
    }
  }

  handleBack() {
    this.back.emit(this.match);
  }

  handleDispute() {
    this.dispute.emit(this.match.id);
  }

  ngOnChanges() {
    if (this.match != null) {
      this.allParticipantsPresent = true;
      for (let opponent of this.match.opponents) {
        if (!opponent.user && !opponent.team) {
          this.allParticipantsPresent = false;
          break;
        }
      }
    }
  }

  validate(score: number, index: number) {
    this.errors[index] = '';
    if (score == null) {
      this.errors[index] = 'Please insert a number'
    } else if (score < 0) {
      this.errors[index] = 'Score must be a positive number'
    }
    this.nrErrors = 0;
    for (let error of this.errors) {
      if (error != null && error.length > 0) { this.nrErrors++; }
    }
  }
}

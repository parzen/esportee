import {Pipe, PipeTransform} from '@angular/core';
import {MatchState, StringUtils} from 'tournament-creator-ts';

@Pipe({name: 'matchStatus'})
export class MatchStatusPipe implements PipeTransform {
  transform(matchState: MatchState): string {
    return StringUtils.getMatchString(matchState);
  }
}

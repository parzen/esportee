import { FormControl } from '@angular/forms';
import {IMatch, MatchFactory, TcUtils, MatchState} from 'tournament-creator-ts';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{2,})+$/;

export class StringUtils {
  static isEmpty(input: string) {
    return input == null || input.length <= 0;
  }

  static isNumeric(value: string) {
    return /^\d+$/.test(value);
  }

  static noWhitespaceValidator(control: FormControl) {
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
  }

  static emailValidator(control: FormControl) {
    let isValid = EMAIL_REGEX.test(control.value);
    return isValid ? null : { 'email': true }
  }

  static getMatchString(match: IMatch): string {
    let string = "";
    let result = " ";

    match.opponents = TcUtils.sortByKey(match.opponents, 'advantage', 'descending');

    for (let i = 0; i < match.opponents.length; i++) {
      let opponent = match.opponents[i];

      if (opponent.user) {
        string = string.concat(opponent.user.username);
      } else if (opponent.team) {
        string = string.concat(opponent.team.name);
      } else {
        if (opponent.token === MatchFactory.EMPTY_ENTRY.token) {
          string = string.concat('free');
        } else {
          string = string.concat('TBD');
        }
      }
      result = result.concat(opponent.score);

      if (i < match.opponents.length - 1) {
        string = string.concat(' - ');
        result = result.concat(' : ');
      }
    }

    if (match.status != MatchState.PENDING && match.status != MatchState.DISPUTED && match.status != MatchState.WILDCARD) {
      string = string.concat(result);
    }

    return string;
  }
}

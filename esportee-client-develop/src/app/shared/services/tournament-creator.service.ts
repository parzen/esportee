import {Injectable} from '@angular/core';
import {LoggerService} from './logging.service';
import {ITournamentConfig, TournamentCreator, TournamentFactory} from 'tournament-creator-ts';

@Injectable()
export class TournamentCreatorService {

  service: TournamentCreator = new TournamentCreator(this.logger);

  constructor(public logger: LoggerService) {
  }

  createTournament(userInput: ITournamentConfig): ITournamentConfig {
    return TournamentFactory.createTournament(userInput, false);
  }
}

import {Team} from './team.model';
import {IUserInfo} from '../apiclient/responses/userinfo.interface';
import {TournamentConfig} from 'tournament-creator-ts';

export class ParticipantStat {
  id: number;
  user: IUserInfo;
  team: Team;
  tournamentConfig: TournamentConfig;
  rank: number;
}

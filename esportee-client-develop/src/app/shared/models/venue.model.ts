import {IMatch} from 'tournament-creator-ts';
import {IUserInfo} from '../apiclient/responses/userinfo.interface'

export class Venue {
  id: number;
  name: string;
  user: IUserInfo;
  matches: IMatch[];
}

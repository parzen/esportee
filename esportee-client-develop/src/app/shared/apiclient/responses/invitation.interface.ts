import { InvitationType } from '../api-client.service';

export interface Invitation {
  token: string;
  status: string;
  user: {
    id: number,
    name: string
  };
  team: {
    id: number,
    name: string
  }
  tournamentConfig: {
    id: number,
    name: string
  }
  type: InvitationType;
}

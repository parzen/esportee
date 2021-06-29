import { InvitationType } from "../../models/Invitation";
import { Team } from "../../models/Team";

export interface InvitationReturnObject {
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
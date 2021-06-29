import {IMatchToken} from "../interfaces/IMatchToken";
import {UIDUtils} from "../utils/UIDUtils";

export class MatchToken implements IMatchToken {
    token: string = "" + UIDUtils.getUid();
    score: number;
    advantage: number;
    id: number = UIDUtils.getUid();
    resultApprovedTimestamp: Date;
    user: {
        id: number,
        username: string
    };
    team: {
        id: number,
        name: string
    };
}
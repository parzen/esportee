import {IMatch, MatchState} from "../interfaces/IMatch";
import {IStageConfig} from "../interfaces/IStageConfig";
import {IMatchToken} from "../interfaces/IMatchToken";
import {Venue} from "../interfaces/IReturnObjects";

export class Match implements IMatch {
    id: number;
    stage: IStageConfig;
    status: MatchState;
    venue: Venue;
    bracket: number;
    round: number;
    opponents: IMatchToken[];
    leg: number;
    phase: number;
}
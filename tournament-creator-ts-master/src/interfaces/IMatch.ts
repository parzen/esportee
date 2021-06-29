import {IStageConfig} from "./IStageConfig";
import {IMatchToken} from "./IMatchToken";
import {Venue} from "../interfaces/IReturnObjects";

export interface IMatch {
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

export enum MatchState {
    PENDING,
    WAITING_FOR_REPLY,
    DISPUTED,
    FINISHED,
    WILDCARD
}
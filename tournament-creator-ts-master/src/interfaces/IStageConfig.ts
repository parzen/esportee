import {StageType} from "../stages/StageType";
import {IMatch} from "./IMatch";
import {ITournamentConfig} from "./ITournamentConfig";
import {ITournamentValidationError} from "./ITournamentValidationError";
import {IMatchToken} from "./IMatchToken";
import {previewArray, Venue} from "../interfaces/IReturnObjects";
import {sortRule, tableEntry} from "../utils/TcUtils";

export interface IStageConfig {
    id: number;
    name: string;
    order: number;
    stageType: StageType;
    matches: IMatch[];
    nrParticipants: number;
    legs: number;
    nrGroups: number;
    thirdPlaceMatch: boolean;
    error: ITournamentValidationError;
    config: ITournamentConfig;

    clean();

    scheduleMatches(matchArray: [[IMatchToken[]]],
                    groups: [IMatchToken[]],
                    nrGroups: number,
                    leg: number,
                    round: number,
                    phase: number,
                    venues: Venue[],
                    onlineTournament: boolean): schedulePlan;

    getSortedTableForBracket(bracket: number, sortRule: sortRule[]): tableEntry[];

    getSortedTableForAllBrackets(sortRule: sortRule[]): [tableEntry[]];

    getPreviewArray(pseudoTeamNames: boolean): previewArray[];
}

export interface schedulePlan {
    errors: ITournamentValidationError,
    scheduledMatches: IMatch[],
    round: number
};
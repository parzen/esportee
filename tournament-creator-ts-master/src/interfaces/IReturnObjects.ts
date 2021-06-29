import {IMatchToken} from "./IMatchToken";
import {IMatch} from "./IMatch";
import {ITournamentValidationError} from "./ITournamentValidationError";
export interface MatchGroupArray {
    matchArray: [[IMatchToken[]]],
    groups: [IMatchToken[]]
};

export interface searchMatchesRO {
    matchesInGroup: [[IMatchToken[]]],
    nrMatchesInGroup: number
};

export interface addMatchesToRoundRO {
    errors: ITournamentValidationError,
    matchesInGroup: [[IMatchToken[]]],
    nrMatchesInGroup: number,
    matchesPossible: number,
    matchesInRound: [IMatchToken[]],
    nrMatchesInRound: number,
    matchArray: [[IMatchToken[]]],
    scheduledMatchesForThisRound: IMatch[]
};

export interface previewArray {
    name: string,
    item: any[]
}

export interface Venue {
    id: number;
    name: string;
}
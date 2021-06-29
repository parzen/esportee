import {MatchState} from "../interfaces/IMatch";
export class StringUtils {
    public static isEmpty(str) {
        return (!str || 0 === str.length);
    }

    public static isBlank(str) {
        return (!str || /^\s*$/.test(str));
    }

    public static getMatchString(matchState: MatchState): string {
        let matchString = "unknown";
        switch (matchState) {
            case MatchState.PENDING:
                matchString = "pending";
                break;
            case MatchState.WAITING_FOR_REPLY:
                matchString = "waiting for reply";
                break;
            case MatchState.DISPUTED:
                matchString = "disputed";
                break;
            case MatchState.FINISHED:
                matchString = "finished";
                break;
            case MatchState.WILDCARD:
                matchString = "free";
                break;
        }
        return matchString;
    }
}
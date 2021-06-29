"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IMatch_1 = require("../interfaces/IMatch");
class StringUtils {
    static isEmpty(str) {
        return (!str || 0 === str.length);
    }
    static isBlank(str) {
        return (!str || /^\s*$/.test(str));
    }
    static getMatchString(matchState) {
        let matchString = "unknown";
        switch (matchState) {
            case IMatch_1.MatchState.PENDING:
                matchString = "pending";
                break;
            case IMatch_1.MatchState.WAITING_FOR_REPLY:
                matchString = "waiting for reply";
                break;
            case IMatch_1.MatchState.DISPUTED:
                matchString = "disputed";
                break;
            case IMatch_1.MatchState.FINISHED:
                matchString = "finished";
                break;
            case IMatch_1.MatchState.WILDCARD:
                matchString = "free";
                break;
        }
        return matchString;
    }
}
exports.StringUtils = StringUtils;
//# sourceMappingURL=StringUtils.js.map
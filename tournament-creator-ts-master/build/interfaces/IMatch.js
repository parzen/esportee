"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MatchState;
(function (MatchState) {
    MatchState[MatchState["PENDING"] = 0] = "PENDING";
    MatchState[MatchState["WAITING_FOR_REPLY"] = 1] = "WAITING_FOR_REPLY";
    MatchState[MatchState["DISPUTED"] = 2] = "DISPUTED";
    MatchState[MatchState["FINISHED"] = 3] = "FINISHED";
    MatchState[MatchState["WILDCARD"] = 4] = "WILDCARD";
})(MatchState = exports.MatchState || (exports.MatchState = {}));
//# sourceMappingURL=IMatch.js.map
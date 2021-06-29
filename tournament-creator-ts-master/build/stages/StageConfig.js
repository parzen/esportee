"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UIDUtils_1 = require("../utils/UIDUtils");
const TcUtils_1 = require("../utils/TcUtils");
const IMatch_1 = require("../interfaces/IMatch");
const TournamentCreator_1 = require("../TournamentCreator");
const MatchFactory_1 = require("../matches/MatchFactory");
class StageConfig {
    constructor(model) {
        this.id = UIDUtils_1.UIDUtils.getUid();
        this.matches = [];
        if (model !== undefined) {
            this.id = model.id;
            this.name = model.name;
            this.order = model.order;
            this.stageType = model.stageType;
            this.matches = model.matches;
            this.nrParticipants = model.nrParticipants;
            this.legs = model.legs;
            this.nrGroups = model.nrGroups;
            this.thirdPlaceMatch = model.thirdPlaceMatch;
            this.error = model.error;
            this.config = model.config;
        }
    }
    clean() {
        this.matches = [];
    }
    scheduleMatches(matchArray, groups, nrGroups, leg, round, phase, venues, onlineTournament) {
        let scheduledMatches = [];
        let result = {
            errors: { errorCount: 0, error: { key: "", error: "" } },
            scheduledMatches: scheduledMatches,
            round: round
        };
        // Array containing number of group member per group
        let nrGrpMember = [];
        for (let i = 0; i < nrGroups; i++) {
            nrGrpMember[i] = groups[i].length;
            if ((nrGrpMember[i] % 2) !== 0) {
                TournamentCreator_1.TournamentCreator.Logger.error("Error: nrMemberInGroup is odd, this should not happen!!\n");
            }
        }
        // Array containing the next start team
        let startTeamArray = [];
        for (let i = 0; i < nrGroups; i++) {
            startTeamArray[i] = groups[i][0];
        }
        let matchesInGroup = [[[]]];
        for (let i = 0; i < nrGroups; i++) {
            matchesInGroup[i] = [[]];
            matchesInGroup[i].splice(0, 1);
        }
        // Array holding all matches in current round
        let matchesInRound = [[]];
        let nrMatchesInRound = 0;
        let nrMatchesTotal = round; // round offset if legs > 1
        for (let g = 0; g < nrGroups; g++) {
            nrMatchesTotal += matchArray[g] ? matchArray[g].length : 0;
        }
        let matchesPossible = venues.length;
        if (onlineTournament) {
            matchesPossible = this.nrParticipants;
        }
        let nextGrpStart = 0;
        for (; round < nrMatchesTotal; round++) {
            // Empty matches in round
            matchesInRound = [[]];
            matchesInRound.splice(0, 1);
            nrMatchesInRound = 0;
            // loop over groups
            let grpScanned = 0;
            let grp = nextGrpStart;
            let nrMatchesInGroup = 0;
            let grpStopped = -1;
            // loop over all groups
            while (grpScanned < nrGroups) {
                let matchesSearched = 0;
                // Check if matches in grp left
                let nrMatchesLeft = matchArray[grp] ? matchArray[grp].length : 0;
                if (nrMatchesLeft > 0) {
                    // Get number of left matches in the group array
                    if (matchesInGroup[grp] != null) {
                        nrMatchesInGroup = matchesInGroup[grp].length;
                    }
                    else {
                        nrMatchesInGroup = 0;
                    }
                    // If no matches in group left -> get next matches
                    if (nrMatchesInGroup === 0) {
                        //console.log("\nSearch matches in round: "+round);
                        let result2 = TournamentCreator_1.TournamentCreator.searchMatches(nrGrpMember[grp], grp, matchArray, startTeamArray[grp], matchesInGroup, nrMatchesInGroup);
                        // Update
                        matchesInGroup = result2.matchesInGroup;
                        nrMatchesInGroup = result2.nrMatchesInGroup;
                        matchesSearched = 1;
                    }
                    // If matches in group left -> combine them with current round
                    if (nrMatchesInGroup > 0) {
                        let result2 = this.addMatchesToRound(matchesInGroup, nrMatchesInGroup, matchesPossible, matchesInRound, nrMatchesInRound, matchArray, grp, venues, round, leg, phase, onlineTournament);
                        if (result2.errors.errorCount > 0) {
                            TournamentCreator_1.TournamentCreator.Logger.error("Error: addMatchesToRound() aborts with error! [" + result2.errors.error.error + "]\n");
                            result.errors.errorCount++;
                            result.errors.error = result2.errors.error;
                            return result;
                        }
                        // Update
                        matchesInGroup = result2.matchesInGroup;
                        nrMatchesInGroup = result2.nrMatchesInGroup;
                        matchesPossible = result2.matchesPossible;
                        matchesInRound = result2.matchesInRound;
                        nrMatchesInRound = result2.nrMatchesInRound;
                        matchArray = result2.matchArray;
                        scheduledMatches = scheduledMatches.concat(result2.scheduledMatchesForThisRound);
                    }
                    // if matchesPossible == 0 -> break group-loop;
                    if (matchesPossible === 0 && grpStopped == -1) {
                        grpStopped = grp;
                    }
                }
                if (grp + 1 >= nrGroups) {
                    grp = 0;
                }
                else {
                    grp++;
                }
                grpScanned++;
            } // loop over groups
            grp = grpStopped;
            // Select next group start
            if (matchesInGroup[grp] != null) {
                nrMatchesInGroup = matchesInGroup[grp].length;
            }
            else {
                nrMatchesInGroup = 0;
            }
            if (nrMatchesInGroup > 0 && matchesPossible === 0) {
                // If still matches in group, but no venues anymore, keep group for
                // next round and skip selecting next group
                nextGrpStart = grp;
            }
            else {
                // Take next group as group start
                if (nextGrpStart + 1 >= nrGroups) {
                    nextGrpStart = 0;
                }
                else {
                    nextGrpStart++;
                }
            }
            // Test if any matches not scheduled, if so -> break;
            let nrMatchesLeft = 0;
            for (let g = 0; g < nrGroups; g++) {
                nrMatchesLeft += matchArray[g] ? matchArray[g].length : 0;
            }
            if (nrMatchesLeft === 0) {
                // finish
                break;
            }
            // sanity check
            if (matchesPossible > 0 && nrMatchesInRound === 0) {
                TournamentCreator_1.TournamentCreator.Logger.error("Error: No matches in round " + round + ", this should not happen!!\n");
                result.errors.errorCount++;
                result.errors.error.key = "internal_server_error";
                result.errors.error.error = "Error: No matches in round " + round + ", this should not happen!!\n";
                return result;
            }
            // sanity check
            if (matchesPossible > 0) {
                // TournamentCreator.Logger.info("Warning: %d empty venue(s) during round! Perhaps not optimal scheduled!\n",matchesPossible);
            }
            matchesPossible = venues.length;
            if (onlineTournament) {
                matchesPossible = this.nrParticipants;
            }
        }
        //TODO: woher kommt error? result.error = error;
        result.scheduledMatches = scheduledMatches;
        result.round = round;
        return result;
    }
    // function sort participants and return array : {pos: number, name: Team.name, played: number, won: number, draw: number, lost: number, for: number, against: number, difference: number, points: number}
    // Example for bracket=2
    //          Played  Won Draw    Lost    For Against Goaldifference  Points
    //  Germany  3      2   1       0       3   0       3               7
    //  Poland   3      2   1       0       2   0       2               7
    // NIreland  3      1   0       2       2   2       0               3
    // Ukraine   3      0   0       3       0   5       -5              0
    getSortedTableForBracket(bracket, sortRule) {
        let matches = this.matches.filter(function (item) {
            return item.bracket === bracket;
        });
        return TcUtils_1.TcUtils.getSortedTable(matches, sortRule, this.id);
    }
    // get sorted table for all groups for current stage: nrGroups x participantsInGroup Array
    getSortedTableForAllBrackets(sortRule) {
        let sortedTable = [[]];
        for (let bracket = 0; bracket < this.nrGroups; bracket++) {
            sortedTable[bracket] = this.getSortedTableForBracket(bracket, sortRule);
        }
        return sortedTable;
    }
    getPreviewArray(pseudoTeamNames) {
        let array = []; // [{name:"", item: []}]
        let name = "";
        let idx = 0;
        let onlyOnce = 0;
        let firstPhase = -1;
        let teamNameIdx = 0;
        let pseudoTeams = [];
        let maxPhase = Math.max.apply(Math, this.matches.map(match => match.phase));
        for (let i = 0; i < this.matches.length; i++) {
            if (this.stageType == "GROUP") {
                idx = this.matches[i].bracket;
                name = "Group " + String.fromCharCode(65 + this.matches[i].bracket);
                onlyOnce = 1;
            }
            else if (this.stageType == "SINGLE_ELIMINATION") {
                idx = this.matches[i].phase;
                if (firstPhase == -1)
                    firstPhase = idx;
                name = TcUtils_1.TcUtils.getSeTitle(maxPhase, this.matches[i].phase, this.thirdPlaceMatch);
                onlyOnce = 0;
            }
            if (array[idx] == undefined) {
                array[idx] = { name: name, item: [] };
            }
            if (onlyOnce) {
                for (let j = 0; j < this.matches[i].opponents.length; j++) {
                    let token = this.matches[i].opponents[j].token;
                    if (pseudoTeamNames) {
                        if (pseudoTeams[idx] == undefined) {
                            pseudoTeams[idx] = [];
                        }
                        if (pseudoTeams[idx].indexOf(token) <= -1 && token != MatchFactory_1.MatchFactory.EMPTY_ENTRY.token) {
                            pseudoTeams[idx].push(token);
                            array[idx].item.push("Team " + String.fromCharCode(65 + teamNameIdx));
                            teamNameIdx++;
                        }
                    }
                    else {
                        if (array[idx].item.indexOf(token) <= -1 && token != MatchFactory_1.MatchFactory.EMPTY_ENTRY.token) {
                            array[idx].item.push(token);
                        }
                    }
                }
            }
            else {
                let vsString = "";
                if (pseudoTeamNames && firstPhase !== idx) {
                    vsString = "TBD";
                }
                else {
                    for (let j = 0; j < this.matches[i].opponents.length; j++) {
                        let token = this.matches[i].opponents[j].token;
                        if (pseudoTeamNames) {
                            token = "Team " + String.fromCharCode(65 + teamNameIdx);
                            teamNameIdx++;
                        }
                        vsString = vsString + token;
                        if (j != this.matches[i].opponents.length - 1) {
                            vsString = vsString + " vs ";
                        }
                    }
                }
                array[idx].item.push(vsString);
            }
        }
        return array;
    }
    addMatchesToRound(matchesInGroup, nrMatchesInGroup, matchesPossible, matchesInRound, nrMatchesInRound, matchArray, grp, venues, round, leg, phase, onlineTournament) {
        let scheduledMatchesForThisRound = [];
        let result = {
            errors: { errorCount: 0, error: { key: "", error: "" } },
            matchesInGroup: matchesInGroup,
            nrMatchesInGroup: nrMatchesInGroup,
            matchesPossible: matchesPossible,
            matchesInRound: matchesInRound,
            nrMatchesInRound: nrMatchesInRound,
            matchArray: matchArray,
            scheduledMatchesForThisRound: scheduledMatchesForThisRound
        };
        // There are matches in the array left
        let lenMatchesInGroupArray = matchesInGroup[grp].length;
        for (let m = 0; m < lenMatchesInGroupArray; m++) {
            if (nrMatchesInGroup === 0) {
                break;
            }
            // Get match from match array
            let newMatch = matchesInGroup[grp][m];
            let newTeamHome = newMatch[0];
            let newTeamAway = newMatch[1];
            // Test if match is wildcard, if so it can be play in every round
            let wildcardMatch = false;
            if (newTeamHome == MatchFactory_1.MatchFactory.EMPTY_ENTRY || newTeamAway == MatchFactory_1.MatchFactory.EMPTY_ENTRY) {
                wildcardMatch = true;
            }
            if (!wildcardMatch && matchesPossible == 0) {
                continue;
            }
            // Test if newMatch is already present in round; this can happen
            // when first the matchesInGroup had some matches left and enough
            // venues were possible, so a new search was conducted
            let teamAlreadyPresentInRound = 0;
            if (!wildcardMatch) {
                for (let q = 0; q < nrMatchesInRound; q++) {
                    let match = matchesInRound[q];
                    if (match == null) {
                        continue;
                    }
                    let teamHome = match[0];
                    let teamAway = match[1];
                    if ((newTeamHome == teamHome) ||
                        (newTeamHome == teamAway) ||
                        (newTeamAway == teamHome) ||
                        (newTeamAway == teamAway)) {
                        teamAlreadyPresentInRound = 1;
                        break;
                    }
                }
            }
            if (teamAlreadyPresentInRound == 1) {
                // If one team already present in round, try next match
                continue;
            }
            // Find newMatch in matchArray
            let beforeNrMatchesInGroupLeft = nrMatchesInGroup;
            let lenMatchesArray = matchArray[grp].length;
            for (let q = 0; q < lenMatchesArray; q++) {
                let match = matchArray[grp][q];
                if (match == null) {
                    continue;
                }
                if (match[0] == newTeamHome && match[1] == newTeamAway) {
                    // remove newMatch from matchArray and matchesInGroup
                    matchArray[grp].splice(q, 1);
                    matchesInGroup[grp].splice(m, 1);
                    // one element left, so go back and decrease length
                    m--;
                    lenMatchesInGroupArray = matchesInGroup[grp].length;
                    nrMatchesInGroup--;
                    // Add match in matchesInRound array
                    matchesInRound.push(newMatch);
                    nrMatchesInRound++;
                    break;
                }
            }
            // sanity check
            if (beforeNrMatchesInGroupLeft === nrMatchesInGroup) {
                TournamentCreator_1.TournamentCreator.Logger.error('Error: IMatch not found, this should not happen!!\n');
                result.errors.errorCount++;
                result.errors.error.key = "internal_server_error";
                result.errors.error.error = "Error: IMatch not found, this should not happen!";
                return result;
            }
            // check if wildcard
            let matchState = IMatch_1.MatchState.PENDING;
            let venue = null;
            if (!wildcardMatch && !onlineTournament) {
                venue = venues[venues.length - matchesPossible];
            }
            if (wildcardMatch) {
                matchState = IMatch_1.MatchState.WILDCARD;
            }
            // Update newMatch in db:
            scheduledMatchesForThisRound.push({
                id: -1,
                stage: null,
                status: matchState,
                venue: venue,
                bracket: grp,
                round: round,
                opponents: [{ token: newTeamHome.token, score: 0, advantage: 1, user: null, team: null, resultApprovedTimestamp: null },
                    { token: newTeamAway.token, score: 0, advantage: 0, user: null, team: null, resultApprovedTimestamp: null }],
                leg: leg,
                phase: phase
            });
            if (!wildcardMatch && !onlineTournament) {
                matchesPossible--;
            }
        }
        // fill result
        result.matchesInGroup = matchesInGroup;
        result.nrMatchesInGroup = nrMatchesInGroup;
        result.matchesPossible = matchesPossible;
        result.matchesInRound = matchesInRound;
        result.nrMatchesInRound = nrMatchesInRound;
        result.matchArray = matchArray;
        result.scheduledMatchesForThisRound = scheduledMatchesForThisRound;
        return result;
    }
    resultHasError(result, stageType) {
        if (result.error != null && result.error.errorCount !== 0) {
            TournamentCreator_1.TournamentCreator.Logger.error("Error: '" + stageType + "'-creation aborts with error: " + result.error.error + "!\n");
            return 1;
        }
        else {
            return 0;
        }
    }
}
exports.StageConfig = StageConfig;
//# sourceMappingURL=StageConfig.js.map
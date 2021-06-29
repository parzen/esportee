"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LoggerFacade_1 = require("./utils/LoggerFacade");
class TournamentCreator {
    constructor(logger) {
        TournamentCreator.Logger.externalLogger = logger;
    }
    static searchMatches(nrMemberInGroup, grp, matchArray, startTeam, matchesInGroup, nrMatchesInGroup) {
        let nrMatchesNeeded = nrMemberInGroup / 2;
        let lenMatchesArray = matchArray[grp].length;
        let skipMatch = [[]];
        skipMatch.splice(0, 1);
        // find first IMatch where startTeam participates
        let firstMatchIdx = -1;
        for (let matchesScanned = 0; matchesScanned < lenMatchesArray; matchesScanned++) {
            let newMatch = matchArray[grp][matchesScanned];
            let newTeamHome = newMatch[0];
            let newTeamAway = newMatch[1];
            if (startTeam == newTeamHome || startTeam == newTeamAway) {
                firstMatchIdx = matchesScanned;
                break;
            }
        }
        if (firstMatchIdx < 0) {
            TournamentCreator.Logger.error("Error: No start match found, this should not happen!!\n");
            return null;
        }
        let attempts = 0;
        let numberOfAttempts = TournamentCreator.fak(lenMatchesArray - 1); // TODO: perhaps set a max value
        let updatedOnNrMatches = 0;
        let updateNumberOfMatches = 0;
        // skip teams, if not enough matches found in last matchesScanned run
        let skippedArray = new Array(nrMatchesNeeded);
        for (let i = 0; i < skippedArray.length; i++) {
            skippedArray[i] = 0;
        }
        while (nrMatchesInGroup < nrMatchesNeeded) {
            nrMatchesInGroup = 0;
            let m = firstMatchIdx;
            for (let matchesScanned = 0; matchesScanned < lenMatchesArray; matchesScanned++) {
                let newMatch = matchArray[grp][m];
                let newTeamHome = newMatch[0];
                let newTeamAway = newMatch[1];
                let addMatch = 0;
                if (nrMatchesInGroup === 0) {
                    // If no matches in round yet
                    addMatch = 1;
                }
                else {
                    let lenMatchesInGroupArray = matchesInGroup[grp].length;
                    addMatch = 1;
                    for (let t = 0; t < lenMatchesInGroupArray; t++) {
                        let match = matchesInGroup[grp][t];
                        let teamHome = match[0]; // A
                        let teamAway = match[1]; // C
                        if ((newTeamHome == teamHome) ||
                            (newTeamHome == teamAway) ||
                            (newTeamAway == teamHome) ||
                            (newTeamAway == teamAway)) {
                            // At least one team is busy, try next newMatch
                            addMatch = 0;
                            break;
                        }
                        else if (skipMatch.indexOf(newMatch) >= 0) {
                            // this match should be skipped
                            addMatch = 0;
                        }
                        else {
                            // Both teams are free in this round
                            addMatch = 1;
                        }
                    }
                }
                // add newMatch in this round
                if (addMatch === 1) {
                    // Add newMatch in match array
                    matchesInGroup[grp].push(newMatch);
                    nrMatchesInGroup++;
                }
                m++;
                if (m >= lenMatchesArray) {
                    m = 0;
                }
            }
            // if not enough matches found (it have to be nrMemberInGroup/2 matches) -> add last match to skip Array and rerun
            if (nrMatchesInGroup < nrMatchesNeeded) {
                // empty skipMatch array
                if (updatedOnNrMatches > nrMatchesInGroup) {
                    skipMatch.splice(skipMatch.length - skippedArray[updatedOnNrMatches - 1], skippedArray[updatedOnNrMatches - 1]);
                    skippedArray[updatedOnNrMatches - 1] = 0;
                }
                // put last match in skipMatch array
                if (nrMatchesInGroup > 1) {
                    updatedOnNrMatches = nrMatchesInGroup;
                    skippedArray[nrMatchesInGroup - 1]++;
                    skipMatch.push(matchesInGroup[grp][nrMatchesInGroup - 1]);
                }
                // Remove all matches from array
                matchesInGroup[grp].splice(0, matchesInGroup[grp].length);
                nrMatchesInGroup = matchesInGroup[grp].length;
                if (nrMatchesInGroup !== 0) {
                    TournamentCreator.Logger.error("Error: Not all matches deleted, this should not happen!!\n");
                }
            }
            else {
                // finish
                break;
            }
            attempts++;
            if ((skipMatch.length >= lenMatchesArray - 1 || attempts >= numberOfAttempts) && nrMatchesInGroup < nrMatchesNeeded) {
                TournamentCreator.Logger.error("Error: Not enough matches found, this should not happen!!\n");
                break;
            }
        }
        // return
        let result = {
            matchesInGroup: matchesInGroup,
            nrMatchesInGroup: nrMatchesInGroup
        };
        return result;
    }
    static validateTournamentArgs(nrGroups, nrParticipants, legs, nrVenues, onlineTournament) {
        let result = { errorCount: 0, error: { key: null, error: null } };
        let nrGroupsError = TournamentCreator.hasError(nrGroups);
        if (nrGroupsError) {
            result.errorCount++;
            result.error.key = "groups";
            result.error.error = nrGroupsError;
        }
        let nrParticipantsError = TournamentCreator.hasError(nrParticipants);
        if (nrParticipantsError) {
            result.errorCount++;
            result.error.key = "nr_participants";
            result.error.error = nrParticipantsError;
        }
        let legsError = TournamentCreator.hasError(legs);
        if (legsError) {
            result.errorCount++;
            result.error.key = "legs";
            result.error.error = legsError;
        }
        if (!onlineTournament) {
            let nrVenuesError = TournamentCreator.hasError(nrVenues);
            if (nrVenuesError) {
                result.errorCount++;
                result.error.key = "venues";
                result.error.error = nrVenuesError;
            }
        }
        return result;
    }
    static hasError(arg) {
        let error;
        if (!arg) {
            error = "missing";
        }
        else if (arg <= 0) {
            error = "invalid";
        }
        return error || false;
    }
    static fak(x) {
        return x * (x > 1 ? TournamentCreator.fak(x - 1) : 1);
    }
}
TournamentCreator.Logger = new LoggerFacade_1.LoggerFacade();
exports.TournamentCreator = TournamentCreator;
//# sourceMappingURL=TournamentCreator.js.map
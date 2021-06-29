"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TcUtils_1 = require("../src/utils/TcUtils");
const IMatch_1 = require("../src/interfaces/IMatch");
const TournamentConfig_1 = require("../src/tournaments/TournamentConfig");
const StageConfig_1 = require("../src/stages/StageConfig");
const TournamentFactory_1 = require("../src/tournaments/TournamentFactory");
const MatchFactory_1 = require("../src/matches/MatchFactory");
class TestHelperFunctions {
    static buildTournament(stages, dummyParticipants) {
        let tournament = new TournamentConfig_1.TournamentConfig();
        tournament.id = 0;
        tournament.name = "Test tournament";
        tournament.stageConfigs = [];
        tournament.status = "running";
        let order = 0;
        for (let stage of stages) {
            tournament = TestHelperFunctions.addStage(order++, tournament, stage.stageType, stage.nrGroups, stage.nrParticipants, stage.legs, stage.nrLocations, stage.thirdPlaceMatch);
        }
        tournament = TournamentFactory_1.TournamentFactory.createTournament(tournament, dummyParticipants);
        return tournament;
    }
    static getMatchTokenForNextStage(tournament, phase) {
        let matchTokens = [[]];
        matchTokens.splice(0, 1);
        let matches = tournament.stageConfigs[0].matches.filter(match => match.phase == phase);
        let maxBracket = Math.max.apply(Math, matches.map(match => match.bracket));
        for (let bracket = 0; bracket <= maxBracket; bracket++) {
            TestHelperFunctions.setMatches(tournament, bracket, phase);
            matchTokens.push(TcUtils_1.TcUtils.updateNextStage(tournament, bracket, phase, 0));
        }
        return matchTokens;
    }
    static setMatches(tournament, bracket, phase) {
        let matches = tournament.stageConfigs[0].matches.filter(match => match.bracket == bracket && match.phase == phase);
        for (let match of matches) {
            match.status = IMatch_1.MatchState.FINISHED;
            let grpNumber0 = "";
            for (let i = 4; i < match.opponents[0].token.length; i++) {
                grpNumber0 = grpNumber0 + match.opponents[0].token[i];
            }
            let grpNumber1 = "";
            for (let i = 4; i < match.opponents[1].token.length; i++) {
                grpNumber1 = grpNumber1 + match.opponents[1].token[i];
            }
            let username0 = match.opponents[0].token[3] + grpNumber0;
            if (match.opponents[0].token == MatchFactory_1.MatchFactory.EMPTY_ENTRY.token) {
                username0 = match.opponents[0].token;
            }
            let username1 = match.opponents[1].token[3] + grpNumber1;
            if (match.opponents[1].token == MatchFactory_1.MatchFactory.EMPTY_ENTRY.token) {
                username1 = match.opponents[1].token;
            }
            // tokens sind: [stage][phase][a-z][A-Z][1234...]; 000aA1 000aA2 ... 100aA1 100aA2 ... 110aA1 110aA2
            match.opponents[0].user = {
                id: TestHelperFunctions.tokenToId(match.opponents[0].token),
                username: username0
            };
            match.opponents[1].user = {
                id: TestHelperFunctions.tokenToId(match.opponents[1].token),
                username: username1
            };
            if (match.opponents[0].token == MatchFactory_1.MatchFactory.EMPTY_ENTRY.token) {
                match.opponents[1].score = 1;
            }
            else if (match.opponents[1].token == MatchFactory_1.MatchFactory.EMPTY_ENTRY.token) {
                match.opponents[0].score = 1;
            }
            else if (parseInt(grpNumber0) < parseInt(grpNumber1)) {
                match.opponents[0].score = 1;
            }
            else {
                match.opponents[1].score = 1;
            }
        }
    }
    static addStage(order, tournament, type, nrGroups, nrParticipants, legs, nrLocations, thirdPlaceMatch) {
        tournament.stageConfigs[order] = new StageConfig_1.StageConfig();
        tournament.stageConfigs[order].id = order;
        tournament.stageConfigs[order].matches = [];
        tournament.stageConfigs[order].legs = legs;
        tournament.stageConfigs[order].nrLocations = nrLocations;
        tournament.stageConfigs[order].nrParticipants = nrParticipants;
        tournament.stageConfigs[order].nrGroups = nrGroups;
        tournament.stageConfigs[order].thirdPlaceMatch = thirdPlaceMatch;
        tournament.stageConfigs[order].name = type + order;
        tournament.stageConfigs[order].stageType = type;
        tournament.stageConfigs[order].order = order;
        return tournament;
    }
    static tokenToId(token) {
        return parseInt(token.replace(/^#/, ''), 16);
    }
    static checkNrParticipantsCorrect(tournament) {
        let tokens = [];
        let matches = tournament.stageConfigs[0].matches.filter(match => match.phase == 0);
        for (let match of matches) {
            // console.log("match: round"+match.round+": "+match.opponents[0].token+" vs "+match.opponents[1].token)
            for (let opponent of match.opponents) {
                if (tokens.indexOf(opponent.token) < 0 && opponent.token != MatchFactory_1.MatchFactory.EMPTY_ENTRY.token) {
                    tokens.push(opponent.token);
                }
            }
        }
        return tokens.length == tournament.stageConfigs[0].nrParticipants;
    }
    static checkTokensOnlyOncePerRound(tournament) {
        let onlyOnce = true;
        for (let stage of tournament.stageConfigs) {
            let minRound = TcUtils_1.TcUtils.sortByKey(stage.matches, "round", "ascending")[0].round;
            let maxRound = TcUtils_1.TcUtils.sortByKey(stage.matches, "round", "descending")[0].round;
            for (let round = minRound; round <= maxRound; round++) {
                let matches = stage.matches.filter(match => match.round == round);
                let tokens = [];
                for (let match of matches) {
                    for (let opponent of match.opponents) {
                        if (tokens.indexOf(opponent.token) < 0) {
                            tokens.push(opponent.token);
                        }
                        else {
                            if (opponent.token != MatchFactory_1.MatchFactory.EMPTY_ENTRY.token) {
                                console.log("Error: token " + opponent.token + " already is in list: " + JSON.stringify(tokens));
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return onlyOnce;
    }
    static checkUpdateNextStageResult(tournament, phase, result) {
        let check = true;
        let matchTokens = TestHelperFunctions.getMatchTokenForNextStage(tournament, phase);
        for (let grp = 0; grp < result.length; grp++) {
            for (let par = 0; par < result[grp].length; par++) {
                if ((matchTokens[grp][par].token != result[grp][par].token) ||
                    (matchTokens[grp][par].advantage != result[grp][par].advantage)) {
                    check = false;
                    break;
                }
                if (result[grp][par].username == MatchFactory_1.MatchFactory.EMPTY_ENTRY.token) {
                    if (matchTokens[grp][par].user) {
                        check = false;
                        break;
                    }
                }
                else {
                    if (matchTokens[grp][par].user.username != result[grp][par].username) {
                        check = false;
                        break;
                    }
                }
            }
        }
        return check;
    }
}
exports.TestHelperFunctions = TestHelperFunctions;
;
//# sourceMappingURL=helperFunctions.spec.js.map
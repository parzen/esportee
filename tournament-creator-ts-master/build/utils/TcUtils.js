"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seedrandom = require("seedrandom");
const IMatch_1 = require("../interfaces/IMatch");
const MatchFactory_1 = require("../matches/MatchFactory");
const StageType_1 = require("../stages/StageType");
;
;
class TcUtils {
    static getSortedTable(matches, sortRule, id) {
        let sortedTable = [];
        let unsortedTable = [];
        unsortedTable = TcUtils.getTable(matches, []);
        sortedTable = TcUtils.sortTable(unsortedTable, matches, sortRule, id, 0);
        sortedTable = TcUtils.setName(sortedTable, matches);
        // Set final position in table
        for (let i = 0; i < sortedTable.length; i++) {
            sortedTable[i].pos = i;
        }
        return sortedTable;
    }
    static getSeTitle(maxPhase, phase, thirdPlaceMatch) {
        let title = "";
        let idx = 1;
        const SE_Phases = ["Final", "Third place play-off", "Semi-Finals", "Quarter-Finals"];
        idx = maxPhase - phase;
        if (idx > 0 && !thirdPlaceMatch) {
            idx++;
        }
        if (idx > 3) {
            title = "Round of " + Math.pow(2, idx);
        }
        else {
            title = SE_Phases[idx];
        }
        return title;
    }
    static setName(table, matches) {
        for (let tableEntry of table) {
            for (let match of matches) {
                for (let opponent of match.opponents) {
                    if (opponent.token == tableEntry.token) {
                        if (opponent.user != null) {
                            tableEntry.name = opponent.user.username;
                            tableEntry.id = opponent.user.id;
                        }
                        else if (opponent.team != null) {
                            tableEntry.name = opponent.team.name;
                            tableEntry.id = opponent.team.id;
                        }
                        else {
                            tableEntry.name = "TBD";
                            tableEntry.id = -1;
                        }
                    }
                }
            }
        }
        return table;
    }
    static sortTable(table, matches, sortRuleArray, id, sortRuleIdx) {
        if (sortRuleIdx === 0) {
            // First, order sorting rule ascending
            sortRuleArray = TcUtils.sortByKey(sortRuleArray, "pos", "ascending");
            if (sortRuleArray.length === 0) {
                console.log("Error: No sorting rule set!\n");
                return [];
            }
        }
        else if (sortRuleIdx >= sortRuleArray.length) {
            //console.log("Reached end of sortRuleArray");
            return table;
        }
        let participants;
        let rule = sortRuleArray[sortRuleIdx].rule;
        let key = "";
        //console.log("%d: Sort rule: %s", sortRuleIdx, rule);
        switch (rule) {
            case "points":
                key = "points";
                break;
            case "difference":
                key = "difference";
                break;
            case "for":
                key = "for";
                break;
            case "points hth":
                key = "points";
                // Make new subtable only with teams in table
                participants = TcUtils.getParticipants(table);
                table = TcUtils.getTable(matches, participants);
                break;
            case "difference hth":
                key = "difference";
                // Make new subtable only with teams in table
                participants = TcUtils.getParticipants(table);
                table = TcUtils.getTable(matches, participants);
                break;
            case "for hth":
                key = "for";
                // Make new subtable only with teams in table
                participants = TcUtils.getParticipants(table);
                table = TcUtils.getTable(matches, participants);
                break;
            case "random":
                table = TcUtils.shuffle(id, table);
                break;
            default:
                console.log("Error: Sorting Rule '%s' unkown!", rule);
        }
        if (key !== "") {
            table = TcUtils.sortByKey(table, key, "descending");
            // if some elements have same entry, sort finer (recursiv)
            let needNextSortRuleIdx = [];
            let locked = 0;
            let tableTmp = table.slice(0);
            let participants = [];
            for (let j = 0; j < table.length; j++) {
                participants.push(table[j].token);
            }
            for (let i = 0; i < table.length; i++) {
                if (locked === 0) {
                    needNextSortRuleIdx.push(i);
                }
                if (i >= table.length - 1 || table[i][key] !== table[i + 1][key]) {
                    if (needNextSortRuleIdx.length > 1) {
                        let tableToResort = [];
                        // Cut out array to sort
                        for (let j = 0; j < needNextSortRuleIdx.length; j++) {
                            let idx = needNextSortRuleIdx[j];
                            tableToResort[j] = table[idx];
                        }
                        let tableResorted = TcUtils.sortTable(tableToResort, matches, sortRuleArray, id, sortRuleIdx + 1);
                        if (tableResorted.length !== needNextSortRuleIdx.length) {
                            console.log("Error: Sorting algorithm failed!");
                            return [];
                        }
                        // Update table with sorted array part
                        for (let j = 0; j < needNextSortRuleIdx.length; j++) {
                            let idx = needNextSortRuleIdx[j];
                            let idx2 = participants.indexOf(tableResorted[j].token);
                            tableTmp[idx] = table[idx2];
                        }
                    }
                    needNextSortRuleIdx = [];
                    locked = 0;
                }
                else {
                    needNextSortRuleIdx.push(i + 1);
                    locked = 1;
                }
            }
            table = tableTmp.slice(0);
            ;
        }
        return table;
    }
    static getTable(allMatches, participantFilter) {
        let unsortedTable = [];
        // Fill participants array
        let participantToken = [];
        if (participantFilter.length === 0) {
            // Get array of all participants
            for (let match of allMatches) {
                for (let opponent of match.opponents) {
                    if (opponent.token != MatchFactory_1.MatchFactory.EMPTY_ENTRY.token && (opponent.user || opponent.team)) {
                        if (participantToken.indexOf(opponent.token) < 0) {
                            participantToken.push(opponent.token);
                        }
                    }
                }
            }
            // sort tokens to get everytime the same result
            participantToken.sort((a, b) => a < b ? -1 : 1);
        }
        else {
            // only use subset of participants
            participantToken = participantFilter;
        }
        // Init table
        for (let i = 0; i < participantToken.length; i++) {
            unsortedTable.push({
                pos: 0,
                token: participantToken[i],
                name: "TBD",
                id: -1,
                played: 0,
                won: 0,
                draw: 0,
                lost: 0,
                for: 0,
                against: 0,
                difference: 0,
                points: 0
            });
        }
        // Update table entries
        for (let match of allMatches) {
            if (match.status !== IMatch_1.MatchState.FINISHED)
                continue;
            // "opponents" = [{token:01234, score:0, advantage:1}, {token:5678, score:2, advantage:0}]
            let opponents = match.opponents;
            // check if all opponents in participants list
            let allPresent = 1;
            for (let opponent of opponents) {
                if (participantToken.indexOf(opponent.token) < 0) {
                    allPresent = 0;
                    break;
                }
            }
            if (allPresent === 0)
                continue;
            // Sort opponents by score descending
            // "opponents" = [{token:5678, score:2, advantage:0}, {token:01234, score:0, advantage:1}]
            opponents = TcUtils.sortByKey(opponents, "score", "descending");
            let maxScore = opponents[0].score;
            let minScore = opponents[opponents.length - 1].score;
            let sumScore = 0;
            for (let opponent of opponents) {
                sumScore += opponent.score;
            }
            // For each opponent
            for (let opponent of opponents) {
                let idx = participantToken.indexOf(opponent.token);
                let against = sumScore - opponent.score;
                unsortedTable[idx].played++;
                unsortedTable[idx].for += opponent.score;
                unsortedTable[idx].against += against;
                unsortedTable[idx].difference += (opponent.score - against);
                if (opponent.score === maxScore && opponent.score > minScore) {
                    unsortedTable[idx].won++;
                    unsortedTable[idx].points += 3; // TODO: die Punkte für einen Sieg sollten einstellbar sein in tournament-object
                }
                else if (opponent.score === maxScore && opponent.score === minScore) {
                    unsortedTable[idx].draw++;
                    unsortedTable[idx].points += 1; // TODO: die Punkte für ein Unentschieden sollten einstellbar sein in tournament-object
                }
                else {
                    unsortedTable[idx].lost++;
                }
            }
        }
        return unsortedTable;
    }
    static getParticipants(table) {
        let participants = [];
        for (let i = 0; i < table.length; i++) {
            participants.push(table[i].token);
        }
        return participants;
    }
    static shuffle(seed, array) {
        let currentIndex = array.length, temporaryValue, randomIndex;
        seedrandom(seed, { global: true });
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    static sortByKey(array, key, order) {
        if (order === "ascending") {
            return array.sort(function (a, b) {
                let x = a[key];
                let y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }
        else {
            return array.sort(function (a, b) {
                let x = a[key];
                let y = b[key];
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            });
        }
    }
    static updateNextStage(tournament, currentBracket, currentPhase, currentStageOrder) {
        let iMatchTokens = [];
        let verbose = 0;
        // TODO: get sort rule from db
        let sortRule = [
            { pos: 0, rule: "points", },
            { pos: 1, rule: "difference" },
            { pos: 3, rule: "for" },
            { pos: 2, rule: "points hth", },
            { pos: 4, rule: "difference hth", },
            { pos: 5, rule: "for hth", },
            { pos: 6, rule: "random", }
        ];
        let currentStage = tournament.stageConfigs.filter(stage => stage.order == currentStageOrder)[0];
        let matches = currentStage.matches.filter(match => match.bracket == currentBracket && match.phase == currentPhase);
        if (matches == null || matches.length == 0) {
            if (verbose)
                console.log("No matches in stage/phase with group:" + currentBracket + " and phase:" + currentPhase + "-> do nothing");
            return iMatchTokens;
        }
        if (!TcUtils.allFinished(matches)) {
            if (verbose)
                console.log("All matches not yet finished in stage:" + currentStageOrder + " group:" + currentBracket + " and phase:" + currentPhase + " -> do nothing");
            return iMatchTokens;
        }
        if (verbose)
            console.log("All matches finished in group: " + currentBracket + " and phase:" + currentPhase + "!");
        let maxPhase = Math.max.apply(Math, currentStage.matches.map(match => match.phase));
        if (currentPhase < maxPhase) {
            // if thirdplaceMatch: final is maxPhase, thirdPlaceMatch is maxPhase-1
            if (currentStage.thirdPlaceMatch && currentPhase == maxPhase - 1) {
                // third place match -> do nothing
            }
            else {
                if (verbose)
                    console.log("Es gibt eine höhere Phase!");
                let nextPhases = [];
                if (currentStage.thirdPlaceMatch && currentPhase == maxPhase - 2) {
                    // At half final: update finale and thirdplacematch
                    nextPhases.push(currentPhase + 2); // +2 = final match
                }
                nextPhases.push(currentPhase + 1);
                let sortedTable = TcUtils.getSortedTable(matches, sortRule, currentStage.id);
                let opponent;
                let nextGroup = Math.floor(currentBracket / 2);
                let advantage = TcUtils.isEven(currentBracket) ? 1 : 0;
                for (let i = 0; i < nextPhases.length; i++) {
                    let nextPhase = nextPhases[i];
                    let matchesInNextGroup = currentStage.matches.filter(match => match.phase == nextPhase && match.bracket == nextGroup);
                    let classified = sortedTable.filter(team => team.pos == i);
                    if (verbose)
                        console.log("classified: " + JSON.stringify(classified));
                    let participant;
                    if (classified.length < 1) {
                        if (verbose)
                            console.log("Not enough participants in group, fill up with empty ones!");
                        participant = null;
                    }
                    else {
                        participant = {
                            id: classified[0].id,
                            name: classified[0].name,
                            username: classified[0].name // TODO: entwender name oder username
                        };
                    }
                    if (matchesInNextGroup.length < 1) {
                        console.log("Error: Found no match in next phase with calculated group, this should not happen!");
                        return iMatchTokens;
                    }
                    for (let matchInGroup of matchesInNextGroup) {
                        if (TcUtils.isEven(matchInGroup.leg)) {
                            opponent = matchInGroup.opponents.filter(opp => opp.advantage == advantage)[0];
                        }
                        else {
                            opponent = matchInGroup.opponents.filter(opp => opp.advantage == 1 - advantage)[0];
                        }
                        if (tournament.isATeamTournament) {
                            opponent.team = participant;
                        }
                        else {
                            opponent.user = participant;
                        }
                        iMatchTokens.push(opponent);
                    }
                }
            }
        }
        else {
            let nextStages = tournament.stageConfigs.filter(stage => stage.order == currentStageOrder + 1);
            if (nextStages.length > 0) {
                if (verbose)
                    console.log("Es gibt eine höhere Stage!");
                let nextStage = nextStages[0];
                if (verbose)
                    console.log("currentStage.nrGroups " + currentStage.nrGroups + " -> " + nextStage.nrGroups + " nextStage.nrGroups");
                if (TcUtils.checkNextStageCombination(currentStage, nextStage) != true) {
                    return iMatchTokens;
                }
                let sortedTable = TcUtils.getSortedTable(matches, sortRule, currentStage.id);
                let classifiedPerGroup = nextStage.nrParticipants / currentStage.nrGroups;
                let nrClassifiedGroups = currentStage.nrGroups;
                let participantsPerMatch = 2;
                let classified = sortedTable.filter(team => team.pos < classifiedPerGroup);
                while (classified.length < classifiedPerGroup) {
                    let emptyTable = {
                        pos: classified.length,
                        id: -1,
                        name: ""
                    };
                    classified.push(emptyTable);
                }
                if (verbose)
                    console.log("classified: " + JSON.stringify(classified));
                let adv = Math.ceil(nextStage.nrGroups / nrClassifiedGroups);
                let center = Math.floor(nextStage.nrGroups / 2);
                let lastGroup = nextStage.nrGroups - 1;
                let nrOfGroupsInSecondHalf = Math.floor(nextStage.nrGroups / 2);
                let offset = nrOfGroupsInSecondHalf > 0 ? TcUtils.mod(Math.floor((nextStage.nrGroups / currentStage.nrGroups) / 2), nrOfGroupsInSecondHalf) : 0; // evtl muss man das noch mod(,4) nehmen
                // clusterSize = Anzahl an Matches die benötigt werden, damit alle Gruppen bzw Position 1x dran waren; Wenn nur 1 Gruppe klassifiziert -> Sonderfall
                let clusterSize = Math.floor(Math.max(nrClassifiedGroups, classifiedPerGroup) / participantsPerMatch);
                if (nrClassifiedGroups === 1) {
                    clusterSize = Math.max(1, center / participantsPerMatch);
                }
                let nrOfCluster = Math.floor(nextStage.nrGroups / clusterSize);
                let lastClusterIdx = Math.max(0, nextStage.nrGroups - clusterSize);
                let lastClusterInFirstHalfIdx = Math.max(0, center - clusterSize);
                // Offsets
                let additionalOffset = Math.floor(Math.floor(currentBracket / nrOfCluster) * (nrOfCluster / participantsPerMatch)); //*Math.floor(classifiedPerGroup/2);
                let nrClusterOffset = Math.floor((nrOfCluster / participantsPerMatch) / 4);
                // special handling
                let special = 0;
                let specialHop = 0;
                if (classifiedPerGroup / 2 /* classified As Home Team */ > nrOfCluster) {
                    special = 1;
                    if (verbose)
                        console.log("Special");
                }
                if (nrClassifiedGroups >= 4 && classifiedPerGroup > nrOfCluster) {
                    if (nrClusterOffset === 0) {
                        nrClusterOffset = Math.floor((classifiedPerGroup / participantsPerMatch) / nrOfCluster);
                    }
                    specialHop = 1;
                    if (verbose)
                        console.log("Specialhop");
                }
                if (verbose) {
                    if (nrOfCluster == classifiedPerGroup) {
                        console.log("Dann geht A1..B1..C1.. (optimal, da A1 auf A_last trifft)");
                    }
                    else {
                        console.log("Dann geht A1..B1..C1.. nicht, dann muss man A1..C1..B1..D1 machen (nicht so optimal, da A1 auf A_last-1 trifft)");
                    }
                }
                if (verbose) {
                    console.log("additionalOffset: " + additionalOffset);
                    console.log("nrClusterOffset: " + nrClusterOffset);
                }
                // set index table
                // for current bracket
                let hop = TcUtils.hopsize(clusterSize, currentBracket, center, specialHop);
                let hop_n = TcUtils.hopsize(clusterSize, TcUtils.neighborBracket(currentBracket, nrClassifiedGroups), center, specialHop);
                let offidx0 = 0 + additionalOffset + hop;
                let offidx1 = center + (additionalOffset + offset) + hop;
                let offidx2 = lastGroup - additionalOffset - hop;
                let offidx3 = (center - 1) - (additionalOffset + offset) - hop;
                if (special === 1) {
                    offidx2 = center - 1 - hop;
                    offidx3 = lastGroup - offset - hop;
                }
                let bracket_offidx = [offidx0, offidx1, offidx2, offidx3];
                // for neighbor bracket
                let n_bracket = TcUtils.neighborBracket(currentBracket, nrClassifiedGroups);
                let n_hop = TcUtils.hopsize(clusterSize, n_bracket, center, specialHop);
                let n_hop_n = TcUtils.hopsize(clusterSize, TcUtils.neighborBracket(n_bracket, nrClassifiedGroups), center, specialHop);
                let n_additionalOffset = Math.floor(Math.floor(n_bracket / nrOfCluster) * (nrOfCluster / participantsPerMatch)); //*Math.floor(classifiedPerGroup/2);
                let n_offidx0 = 0 + additionalOffset + n_hop;
                let n_offidx1 = center + (additionalOffset + offset) + n_hop;
                let n_offidx2 = lastGroup - additionalOffset - n_hop;
                let n_offidx3 = (center - 1) - (additionalOffset + offset) - n_hop;
                if (special === 1) {
                    n_offidx2 = center - 1 - n_hop;
                    n_offidx3 = lastGroup - offset - n_hop;
                }
                let n_bracket_offidx = [n_offidx0, n_offidx1, n_offidx2, n_offidx3];
                let idx = 0;
                for (let team of classified) {
                    let advantage = Math.floor(team.pos / adv);
                    if (currentStage.nrGroups / nextStage.nrGroups > 1) {
                        advantage += TcUtils.mod(currentBracket, 2);
                    }
                    let group = -1;
                    // Set group for current idx
                    if (idx >= classifiedPerGroup / 2) {
                        // above half, just use opposite position of neighbor group (A3 next to B1 ...)
                        group = n_bracket_offidx[TcUtils.getOppositeIdx(idx, classifiedPerGroup)];
                    }
                    else if (idx >= 4) {
                        // if more than 4 elements on left side
                        if (idx > 7) {
                            console.log("Error: higher idx not supported/tested!");
                        }
                        // for current bracket
                        let oppGroup = bracket_offidx[TcUtils.getOppositeIdx(idx, classifiedPerGroup / 2)];
                        let clusterIdxOfOppGroup = TcUtils.getClusterIdx(oppGroup, clusterSize);
                        let clusterIdx = TcUtils.neighborBracket(clusterIdxOfOppGroup, nrOfCluster);
                        let groupIdx = TcUtils.getGroupIdx(oppGroup, clusterSize);
                        group = clusterIdx * clusterSize + groupIdx;
                        if (idx < 6) {
                            group -= 1;
                        }
                        else {
                            group += 1;
                        }
                        bracket_offidx[idx] = group;
                        // for neighbor bracket
                        let n_oppGroup = n_bracket_offidx[TcUtils.getOppositeIdx(idx, classifiedPerGroup / 2)];
                        let n_clusterIdxOfOppGroup = TcUtils.getClusterIdx(n_oppGroup, clusterSize);
                        let n_clusterIdx = TcUtils.neighborBracket(n_clusterIdxOfOppGroup, nrOfCluster);
                        let n_groupIdx = TcUtils.getGroupIdx(n_oppGroup, clusterSize);
                        let n_group = n_clusterIdx * clusterSize + n_groupIdx;
                        if (idx < 6) {
                            n_group -= 1;
                        }
                        else {
                            n_group += 1;
                        }
                        n_bracket_offidx[idx] = n_group;
                    }
                    else {
                        // first 4 elements
                        group = bracket_offidx[idx];
                    }
                    group = TcUtils.mod(group, nextStage.nrGroups);
                    if (verbose && idx === 0) {
                        console.log("center: " + center + " | clusterSize: " + clusterSize + " | nrOfCluster: " + nrOfCluster + " | lastClusterIdx: " + lastClusterIdx + " | lastClusterInFirstHalfIdx: " + lastClusterInFirstHalfIdx + " | offset: " + offset + " | additionalOffset: " + additionalOffset + " | classifiedPerGroup: " + classifiedPerGroup + " | nrClassifiedGroups: " + nrClassifiedGroups);
                    }
                    if (verbose)
                        console.log("[" + group + "][" + advantage + "] -> " + team.name + " (id: " + team.id + ")");
                    // update match
                    let participant = {
                        id: team.id,
                        name: team.name,
                        username: team.name // TODO: entwender name oder username
                    };
                    if (participant.id == -1) {
                        participant = null;
                    }
                    let opponent;
                    let matchesInGroup = nextStage.matches.filter(match => match.bracket == group && match.phase == 0);
                    for (let matchInGroup of matchesInGroup) {
                        if (TcUtils.isEven(matchInGroup.leg)) {
                            opponent = matchInGroup.opponents.filter(opp => opp.advantage == 1 - advantage)[0];
                        }
                        else {
                            opponent = matchInGroup.opponents.filter(opp => opp.advantage == advantage)[0];
                        }
                        if (tournament.isATeamTournament) {
                            opponent.team = participant;
                        }
                        else {
                            opponent.user = participant;
                        }
                        iMatchTokens.push(opponent);
                        //console.log("Updated opponent: "+JSON.stringify(opponent));
                    }
                    idx++;
                }
            }
        }
        return iMatchTokens;
    }
    // all matches count as finished when: status is finished or status is wildcard and has either empty token or user/team
    static allFinished(matches) {
        for (let match of matches) {
            if (match.status != IMatch_1.MatchState.FINISHED && match.status != IMatch_1.MatchState.WILDCARD) {
                return false;
            }
            if (match.status == IMatch_1.MatchState.WILDCARD) {
                for (let opponent of match.opponents) {
                    if (opponent.token != MatchFactory_1.MatchFactory.EMPTY_ENTRY.token && !opponent.user && !opponent.team) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    static checkNextStageCombination(currentStage, nextStage) {
        let validCombination = true;
        if (currentStage.nrParticipants < nextStage.nrParticipants) {
            console.log("Error: Number of participants for next stage must not be higher than current stage!");
            validCombination = false;
        }
        if (currentStage.nrGroups > nextStage.nrParticipants) {
            // TODO: warte bis alle matches in currentStages finished, dann erzeuge neue sortedTable mit length == nextStage.nrParticipants
            console.log("Error: Not yet implemented! Number of groups must be lower than nr participants for next stage!");
            validCombination = false;
        }
        // Up to now, only Group -> SE allowed
        if (!(currentStage.stageType == StageType_1.StageType.GROUP && nextStage.stageType == StageType_1.StageType.SINGLE_ELIMINATION)) {
            validCombination = false;
        }
        if (this.checkCombination(currentStage.nrGroups, nextStage.nrGroups) != true) {
            console.log("Error: " + currentStage.nrGroups + " -> " + nextStage.nrGroups + " is an unsupported/untested combination!");
            validCombination = false;
        }
        return validCombination;
    }
    static checkCombination(currentNrGroups, nextNrGroups) {
        let testedCombination = false;
        if (currentNrGroups == 1) {
            switch (nextNrGroups) {
                case 1:
                case 2:
                case 4:
                    testedCombination = true;
                    break;
            }
        }
        else if (currentNrGroups == 2) {
            switch (nextNrGroups) {
                case 1:
                case 2:
                case 4:
                case 8:
                    testedCombination = true;
                    break;
            }
        }
        else if (currentNrGroups == 4) {
            switch (nextNrGroups) {
                case 2:
                case 4:
                case 8:
                case 16:
                    testedCombination = true;
                    break;
            }
        }
        else if (currentNrGroups == 8) {
            switch (nextNrGroups) {
                case 4:
                case 8:
                case 16:
                case 32:
                case 64:
                    testedCombination = true;
                    break;
            }
        }
        else if (currentNrGroups == 16) {
            switch (nextNrGroups) {
                case 8:
                case 16:
                case 32:
                case 64:
                    testedCombination = true;
                    break;
            }
        }
        return testedCombination;
    }
    static getOppositeIdx(idx, lastIdx) {
        return (lastIdx - 1) - idx;
    }
    static getGroupIdx(group, clusterSize) {
        let off = Math.floor(group / clusterSize);
        return group - off * clusterSize;
    }
    static mod(n, m) {
        return ((n % m) + m) % m;
    }
    static isEven(x) {
        if (TcUtils.mod(x, 2) === 0) {
            // even
            return true;
        }
        else {
            // uneven
            return false;
        }
    }
    static hopsize(clusterSize, bracket, center, special) {
        let i;
        let hop = clusterSize * bracket;
        // 0 -> +0 | 1 -> +c | 2 -> +1 | 3 -> +c+1
        if (special) {
            if (TcUtils.isEven(bracket)) {
                hop = clusterSize * Math.floor(bracket / 2);
            }
            else {
                hop = center + clusterSize * Math.floor(bracket / 2);
            }
        }
        return hop;
    }
    static neighborBracket(bracket, nrClassifiedGroups) {
        if (nrClassifiedGroups === 1) {
            return bracket;
        }
        else {
            if (TcUtils.isEven(bracket)) {
                return bracket + 1;
            }
            else {
                return bracket - 1;
            }
        }
    }
    static getClusterIdx(group, clusterSize) {
        return Math.floor(group / clusterSize);
    }
}
exports.TcUtils = TcUtils;
//# sourceMappingURL=TcUtils.js.map
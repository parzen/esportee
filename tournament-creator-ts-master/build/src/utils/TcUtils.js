"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seedrandom = require("seedrandom");
const IMatch_1 = require("../interfaces/IMatch");
const MatchFactory_1 = require("../matches/MatchFactory");
;
;
class TcUtils {
    static getSortedTable(matches, sortRule, id) {
        let sortedTable = [];
        let unsortedTable = [];
        unsortedTable = TcUtils.getTable(matches, []);
        //console.log("unsortedTable:");console.log(unsortedTable);
        sortedTable = TcUtils.sortTable(unsortedTable, matches, sortRule, id, 0);
        //console.log("sortedTable:");console.log(sortedTable);
        sortedTable = TcUtils.setUsername(sortedTable, matches);
        // Set final position in table
        for (let i = 0; i < sortedTable.length; i++) {
            sortedTable[i].pos = i;
        }
        return sortedTable;
    }
    static getSeTitle(maxPhase, phase, thirdPlaceMatch) {
        let title = "";
        let idx = 1;
        const SE_Phases = ["Third place play-off", "Final", "Semi-Finals", "Quarter-Finals"];
        idx = maxPhase - phase;
        if (!thirdPlaceMatch) {
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
    static setUsername(table, matches) {
        for (let tableEntry of table) {
            for (let match of matches) {
                for (let opponent of match.opponents) {
                    if (opponent.token == tableEntry.token) {
                        if (opponent.user != null) {
                            tableEntry.username = opponent.user.username;
                            tableEntry.userid = opponent.user.id;
                        }
                        else {
                            tableEntry.username = "TBD";
                            tableEntry.userid = -1;
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
                    if (opponent.token != MatchFactory_1.MatchFactory.EMPTY_ENTRY.token && opponent.user) {
                        if (participantToken.indexOf(opponent.token) < 0) {
                            participantToken.push(opponent.token);
                        }
                    }
                }
            }
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
                username: "TBD",
                userid: -1,
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
            // if thirdplaceMatch: final is maxPhase-1, thirdPlaceMatch is maxPhase
            if (currentStage.thirdPlaceMatch && currentPhase == maxPhase - 1) {
                // final match
            }
            else {
                if (verbose)
                    console.log("Es gibt eine höhere Phase!");
                let nextPhases = [currentPhase + 1];
                if (currentStage.thirdPlaceMatch && currentPhase == maxPhase - 2) {
                    // At half final: update finale and thirdplacematch
                    nextPhases.push(currentPhase + 2); // thirdplacematch
                }
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
                    let user;
                    if (classified.length < 1) {
                        if (verbose)
                            console.log("Not enough participants in group, fill up with empty ones!");
                        user = null;
                    }
                    else {
                        user = {
                            id: classified[0].userid,
                            username: classified[0].username
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
                        opponent.user = user;
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
                // sanity check
                if (currentStage.nrParticipants < nextStage.nrParticipants) {
                    console.log("Error: Number of participants for next stage must not be higher than current stage!");
                    return iMatchTokens;
                }
                /*if (currentStage.nrGroups < 2 || ((currentStage.nrGroups & (currentStage.nrGroups - 1)) != 0)) {
                    // TODO: support this
                    console.log("Error: Not yet implemented! Number of groups must be a power of 2!");
                    return iMatchTokens;
                }*/
                if (currentStage.nrGroups > nextStage.nrParticipants) {
                    // TODO: warte bis alle matches in currentStages finished, dann erzeuge neue sortedTable mit length == nextStage.nrParticipants
                    console.log("Error: Not yet implemented! Number of groups must be lower than nr participants for next stage!");
                    return iMatchTokens;
                }
                if (verbose)
                    console.log("currentStage.nrGroups " + currentStage.nrGroups + " -> " + nextStage.nrGroups + " nextStage.nrGroups");
                // test combination
                TcUtils.checkCombination(currentStage.nrGroups, nextStage.nrGroups);
                let sortedTable = TcUtils.getSortedTable(matches, sortRule, currentStage.id);
                let classifiedPerGroup = nextStage.nrParticipants / currentStage.nrGroups;
                let nrClassifiedGroups = currentStage.nrGroups;
                let participantsPerMatch = 2;
                let classified = sortedTable.filter(team => team.pos < classifiedPerGroup);
                while (classified.length < classifiedPerGroup) {
                    let emptyTable = {
                        pos: classified.length,
                        userid: -1,
                        username: ""
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
                        console.log("[" + group + "][" + advantage + "] -> " + team.username + " (id: " + team.userid + ")");
                    // update match
                    let user = {
                        id: team.userid,
                        username: team.username
                    };
                    if (user.id == -1) {
                        user = null;
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
                        opponent.user = user;
                        iMatchTokens.push(opponent);
                        //console.log("Updated opponent: "+JSON.stringify(opponent));
                    }
                    idx++;
                }
            }
        }
        return iMatchTokens;
    }
    // all matches count as finished when: status is finished or status is wildcard and has either empty token or user
    static allFinished(matches) {
        for (let match of matches) {
            if (match.status != IMatch_1.MatchState.FINISHED && match.status != IMatch_1.MatchState.WILDCARD) {
                return false;
            }
            if (match.status == IMatch_1.MatchState.WILDCARD) {
                for (let opponent of match.opponents) {
                    if (opponent.token != MatchFactory_1.MatchFactory.EMPTY_ENTRY.token && !opponent.user) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    static checkCombination(currentNrGroups, nextNrGroups) {
        let testedCombination = false;
        if (currentNrGroups === 1) {
            switch (nextNrGroups) {
                case 1:
                case 2:
                case 4:
                    testedCombination = true;
                    break;
            }
        }
        else if (currentNrGroups === 2) {
            switch (nextNrGroups) {
                case 1:
                case 2:
                case 4:
                case 8:
                    testedCombination = true;
                    break;
            }
        }
        else if (currentNrGroups === 4) {
            switch (nextNrGroups) {
                case 2:
                case 4:
                case 8:
                case 16:
                    testedCombination = true;
                    break;
            }
        }
        else if (currentNrGroups === 8) {
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
        else if (currentNrGroups === 16) {
            switch (nextNrGroups) {
                case 8:
                case 16:
                case 32:
                case 64:
                    testedCombination = true;
                    break;
            }
        }
        if (testedCombination == false) {
            console.log("WARNING: This is an untested combination!!");
        }
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
////////////////////////////////////////////////////////////////////7
// Testdata
let sortRule = [
    { pos: 0, rule: "points", },
    { pos: 1, rule: "difference" },
    { pos: 2, rule: "for" },
    { pos: 3, rule: "points hth", },
    { pos: 4, rule: "difference hth", },
    { pos: 5, rule: "for hth", },
    { pos: 6, rule: "random", }
];
let demoSortedTable = [
    [{
            "pos": 0,
            "participant": "A1",
            "played": 3,
            "won": 2,
            "draw": 1,
            "lost": 0,
            "for": 4,
            "against": 1,
            "difference": 3,
            "points": 7
        },
        {
            "pos": 1,
            "participant": "A2",
            "played": 3,
            "won": 1,
            "draw": 2,
            "lost": 0,
            "for": 2,
            "against": 1,
            "difference": 1,
            "points": 5
        },
        {
            "pos": 2,
            "participant": "A3",
            "played": 3,
            "won": 1,
            "draw": 0,
            "lost": 2,
            "for": 1,
            "against": 3,
            "difference": -2,
            "points": 3
        },
        {
            "pos": 3,
            "participant": "A4",
            "played": 3,
            "won": 0,
            "draw": 1,
            "lost": 2,
            "for": 2,
            "against": 4,
            "difference": -2,
            "points": 1
        }],
    [{
            "pos": 0,
            "participant": "B1",
            "played": 3,
            "won": 2,
            "draw": 0,
            "lost": 1,
            "for": 6,
            "against": 3,
            "difference": 3,
            "points": 6
        },
        {
            "pos": 1,
            "participant": "B2",
            "played": 3,
            "won": 1,
            "draw": 2,
            "lost": 0,
            "for": 3,
            "against": 2,
            "difference": 1,
            "points": 5
        },
        {
            "pos": 2,
            "participant": "B3",
            "played": 3,
            "won": 1,
            "draw": 1,
            "lost": 1,
            "for": 3,
            "against": 3,
            "difference": 0,
            "points": 4
        },
        {
            "pos": 3,
            "participant": "B4",
            "played": 3,
            "won": 0,
            "draw": 1,
            "lost": 2,
            "for": 2,
            "against": 6,
            "difference": -4,
            "points": 1
        }],
    [{
            "pos": 0,
            "participant": "C1",
            "played": 3,
            "won": 2,
            "draw": 1,
            "lost": 0,
            "for": 3,
            "against": 0,
            "difference": 3,
            "points": 7
        },
        {
            "pos": 1,
            "participant": "C2",
            "played": 3,
            "won": 2,
            "draw": 1,
            "lost": 0,
            "for": 2,
            "against": 0,
            "difference": 2,
            "points": 7
        },
        {
            "pos": 2,
            "participant": "C3",
            "played": 3,
            "won": 1,
            "draw": 0,
            "lost": 2,
            "for": 2,
            "against": 2,
            "difference": 0,
            "points": 3
        },
        {
            "pos": 3,
            "participant": "C4",
            "played": 3,
            "won": 0,
            "draw": 0,
            "lost": 3,
            "for": 0,
            "against": 5,
            "difference": -5,
            "points": 0
        }],
    [{
            "pos": 0,
            "participant": "D1",
            "played": 3,
            "won": 2,
            "draw": 1,
            "lost": 0,
            "for": 5,
            "against": 3,
            "difference": 2,
            "points": 7
        },
        {
            "pos": 1,
            "participant": "D2",
            "played": 3,
            "won": 2,
            "draw": 0,
            "lost": 1,
            "for": 5,
            "against": 2,
            "difference": 3,
            "points": 6
        },
        {
            "pos": 2,
            "participant": "D3",
            "played": 3,
            "won": 1,
            "draw": 0,
            "lost": 2,
            "for": 2,
            "against": 4,
            "difference": -2,
            "points": 3
        },
        {
            "pos": 3,
            "participant": "D4",
            "played": 3,
            "won": 0,
            "draw": 1,
            "lost": 2,
            "for": 2,
            "against": 5,
            "difference": -3,
            "points": 1
        }],
    [{
            "pos": 0,
            "participant": "E1",
            "played": 3,
            "won": 2,
            "draw": 1,
            "lost": 0,
            "for": 4,
            "against": 1,
            "difference": 3,
            "points": 7
        },
        {
            "pos": 1,
            "participant": "E2",
            "played": 3,
            "won": 1,
            "draw": 2,
            "lost": 0,
            "for": 2,
            "against": 1,
            "difference": 1,
            "points": 5
        },
        {
            "pos": 2,
            "participant": "E3",
            "played": 3,
            "won": 1,
            "draw": 0,
            "lost": 2,
            "for": 1,
            "against": 3,
            "difference": -2,
            "points": 3
        },
        {
            "pos": 3,
            "participant": "E4",
            "played": 3,
            "won": 0,
            "draw": 1,
            "lost": 2,
            "for": 2,
            "against": 4,
            "difference": -2,
            "points": 1
        }],
    [{
            "pos": 0,
            "participant": "F1",
            "played": 3,
            "won": 2,
            "draw": 0,
            "lost": 1,
            "for": 6,
            "against": 3,
            "difference": 3,
            "points": 6
        },
        {
            "pos": 1,
            "participant": "F2",
            "played": 3,
            "won": 1,
            "draw": 2,
            "lost": 0,
            "for": 3,
            "against": 2,
            "difference": 1,
            "points": 5
        },
        {
            "pos": 2,
            "participant": "F3",
            "played": 3,
            "won": 1,
            "draw": 1,
            "lost": 1,
            "for": 3,
            "against": 3,
            "difference": 0,
            "points": 4
        },
        {
            "pos": 3,
            "participant": "F4",
            "played": 3,
            "won": 0,
            "draw": 1,
            "lost": 2,
            "for": 2,
            "against": 6,
            "difference": -4,
            "points": 1
        }],
    [{
            "pos": 0,
            "participant": "G1",
            "played": 3,
            "won": 2,
            "draw": 1,
            "lost": 0,
            "for": 3,
            "against": 0,
            "difference": 3,
            "points": 7
        },
        {
            "pos": 1,
            "participant": "G2",
            "played": 3,
            "won": 2,
            "draw": 1,
            "lost": 0,
            "for": 2,
            "against": 0,
            "difference": 2,
            "points": 7
        },
        {
            "pos": 2,
            "participant": "G3",
            "played": 3,
            "won": 1,
            "draw": 0,
            "lost": 2,
            "for": 2,
            "against": 2,
            "difference": 0,
            "points": 3
        },
        {
            "pos": 3,
            "participant": "G4",
            "played": 3,
            "won": 0,
            "draw": 0,
            "lost": 3,
            "for": 0,
            "against": 5,
            "difference": -5,
            "points": 0
        }],
    [{
            "pos": 0,
            "participant": "H1",
            "played": 3,
            "won": 2,
            "draw": 1,
            "lost": 0,
            "for": 5,
            "against": 3,
            "difference": 2,
            "points": 7
        },
        {
            "pos": 1,
            "participant": "H2",
            "played": 3,
            "won": 2,
            "draw": 0,
            "lost": 1,
            "for": 5,
            "against": 2,
            "difference": 3,
            "points": 6
        },
        {
            "pos": 2,
            "participant": "H3",
            "played": 3,
            "won": 1,
            "draw": 0,
            "lost": 2,
            "for": 2,
            "against": 4,
            "difference": -2,
            "points": 3
        },
        {
            "pos": 3,
            "participant": "H4",
            "played": 3,
            "won": 0,
            "draw": 1,
            "lost": 2,
            "for": 2,
            "against": 5,
            "difference": -3,
            "points": 1
        }]
];
let stageDB = {
    order: 0,
    name: "Gruppenphase EM 2016",
    mode: "group",
    playercount: 24
};
let stageDBse = {
    order: 1,
    name: "KO-Runde EM 2016",
    mode: "single-elimation",
    playercount: 16
};
let gameDB = {
    title: "FIFA 16",
    shortName: "FIFA 16",
    description: "FIFA 16 is an association football simulation video game developed by EA Canada and published by EA Sports for Microsoft Windows, PlayStation 3, PlayStation 4, Xbox 360, Xbox One, Android and iOS.",
    studio: "EA Sports",
    publisher: "Electronic Arts",
    genre: "Fußballsimulation",
    ageRating: "0"
};
let tournamentDB = {
    title: "Europameisterschaft 2016",
    shortName: "EM2016",
    owner: 0,
    game: gameDB,
    status: "finished",
    start: new Date("2016-06-06"),
    end: new Date("2016-07-06"),
    visible: true,
    address: "Stade de Frace",
    city: "Paris",
    country: "Frankreich",
    participants: 24
};
let matchesDB = [
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Paris St. Denis",
        vids: [],
        bracket: 0,
        round: 0,
        opponents: [{ participant: "Frankreich", score: 2, advantage: 1 }, {
                participant: "Rumaenien",
                score: 1,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lens",
        vids: [],
        bracket: 0,
        round: 0,
        opponents: [{ participant: "Albanien", score: 0, advantage: 1 }, {
                participant: "Schweiz",
                score: 1,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Bordeaux",
        vids: [],
        bracket: 1,
        round: 0,
        opponents: [{ participant: "Wales", score: 2, advantage: 1 }, { participant: "Slowakei", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Marseille",
        vids: [],
        bracket: 1,
        round: 0,
        opponents: [{ participant: "England", score: 1, advantage: 1 }, {
                participant: "Russland",
                score: 1,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Paris",
        vids: [],
        bracket: 3,
        round: 0,
        opponents: [{ participant: "Tuerkei", score: 0, advantage: 1 }, {
                participant: "Kroatien",
                score: 1,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 2,
        round: 0,
        opponents: [{ participant: "Polen", score: 1, advantage: 1 }, {
                participant: "Nordirland",
                score: 0,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lille",
        vids: [],
        bracket: 2,
        round: 0,
        opponents: [{ participant: "Deutschland", score: 2, advantage: 1 }, {
                participant: "Ukraine",
                score: 0,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Toulouse",
        vids: [],
        bracket: 3,
        round: 0,
        opponents: [{ participant: "Spanien", score: 1, advantage: 1 }, {
                participant: "Tschechien",
                score: 0,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Paris St. Denis",
        vids: [],
        bracket: 4,
        round: 0,
        opponents: [{ participant: "Irland", score: 1, advantage: 1 }, { participant: "Schweden", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lyon",
        vids: [],
        bracket: 4,
        round: 0,
        opponents: [{ participant: "Belgien", score: 0, advantage: 1 }, { participant: "Italien", score: 2, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Bordeaux",
        vids: [],
        bracket: 5,
        round: 0,
        opponents: [{ participant: "Oesterreich", score: 0, advantage: 1 }, {
                participant: "Ungarn",
                score: 2,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Saint-Etienne",
        vids: [],
        bracket: 5,
        round: 0,
        opponents: [{ participant: "Portugal", score: 1, advantage: 1 }, { participant: "Island", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lille",
        vids: [],
        bracket: 1,
        round: 0,
        opponents: [{ participant: "Russland", score: 1, advantage: 1 }, {
                participant: "Slowakei",
                score: 2,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Paris",
        vids: [],
        bracket: 0,
        round: 1,
        opponents: [{ participant: "Rumaenien", score: 1, advantage: 1 }, {
                participant: "Schweiz",
                score: 1,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Marseille",
        vids: [],
        bracket: 0,
        round: 1,
        opponents: [{ participant: "Frankreich", score: 2, advantage: 1 }, {
                participant: "Albanien",
                score: 0,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lens",
        vids: [],
        bracket: 1,
        round: 1,
        opponents: [{ participant: "England", score: 2, advantage: 1 }, { participant: "Wales", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lyon",
        vids: [],
        bracket: 2,
        round: 1,
        opponents: [{ participant: "Ukraine", score: 0, advantage: 1 }, {
                participant: "Nordirland",
                score: 2,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Paris St. Denis",
        vids: [],
        bracket: 2,
        round: 1,
        opponents: [{ participant: "Deutschland", score: 0, advantage: 1 }, {
                participant: "Polen",
                score: 0,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Toulouse",
        vids: [],
        bracket: 4,
        round: 1,
        opponents: [{ participant: "Italien", score: 1, advantage: 1 }, {
                participant: "Schweden",
                score: 0,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Saint-Etienne",
        vids: [],
        bracket: 3,
        round: 1,
        opponents: [{ participant: "Tschechien", score: 2, advantage: 1 }, {
                participant: "Kroatien",
                score: 2,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 3,
        round: 1,
        opponents: [{ participant: "Spanien", score: 3, advantage: 1 }, { participant: "Tuerkei", score: 0, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Bordeaux",
        vids: [],
        bracket: 4,
        round: 1,
        opponents: [{ participant: "Belgien", score: 3, advantage: 1 }, { participant: "Irland", score: 0, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Marseille",
        vids: [],
        bracket: 5,
        round: 1,
        opponents: [{ participant: "Island", score: 1, advantage: 1 }, { participant: "Ungarn", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Paris",
        vids: [],
        bracket: 5,
        round: 1,
        opponents: [{ participant: "Portugal", score: 0, advantage: 1 }, {
                participant: "Oesterreich",
                score: 0,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lille",
        vids: [],
        bracket: 0,
        round: 2,
        opponents: [{ participant: "Schweiz", score: 0, advantage: 1 }, {
                participant: "Frankreich",
                score: 0,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lyon",
        vids: [],
        bracket: 0,
        round: 2,
        opponents: [{ participant: "Rumaenien", score: 0, advantage: 1 }, {
                participant: "Albanien",
                score: 1,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Saint-Etienne",
        vids: [],
        bracket: 1,
        round: 2,
        opponents: [{ participant: "Slowakei", score: 0, advantage: 1 }, {
                participant: "England",
                score: 0,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Toulouse",
        vids: [],
        bracket: 1,
        round: 2,
        opponents: [{ participant: "Russland", score: 0, advantage: 1 }, { participant: "Wales", score: 3, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Marseille",
        vids: [],
        bracket: 2,
        round: 2,
        opponents: [{ participant: "Ukraine", score: 0, advantage: 1 }, { participant: "Polen", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Paris",
        vids: [],
        bracket: 2,
        round: 2,
        opponents: [{ participant: "Nordirland", score: 0, advantage: 1 }, {
                participant: "Deutschland",
                score: 1,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Bordeaux",
        vids: [],
        bracket: 3,
        round: 2,
        opponents: [{ participant: "Kroatien", score: 2, advantage: 1 }, {
                participant: "Spanien",
                score: 1,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lens",
        vids: [],
        bracket: 3,
        round: 2,
        opponents: [{ participant: "Tschechien", score: 0, advantage: 1 }, {
                participant: "Tuerkei",
                score: 2,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lyon",
        vids: [],
        bracket: 5,
        round: 2,
        opponents: [{ participant: "Ungarn", score: 3, advantage: 1 }, { participant: "Portugal", score: 3, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Paris St. Denis   ",
        vids: [],
        bracket: 5,
        round: 2,
        opponents: [{ participant: "Island", score: 2, advantage: 1 }, {
                participant: "Oesterreich",
                score: 1,
                advantage: 0
            }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Lille",
        vids: [],
        bracket: 4,
        round: 2,
        opponents: [{ participant: "Italien", score: 0, advantage: 1 }, { participant: "Irland", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 4,
        round: 2,
        opponents: [{ participant: "Schweden", score: 0, advantage: 1 }, {
                participant: "Belgien",
                score: 1,
                advantage: 0
            }],
        leg: 0
    },
    // Bracket 6 ist zum Testen von direkten Vergleich
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team A", score: 2, advantage: 1 }, { participant: "Team B", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team C", score: 2, advantage: 1 }, { participant: "Team D", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team D", score: 2, advantage: 1 }, { participant: "Team A", score: 0, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team C", score: 2, advantage: 1 }, { participant: "Team B", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team A", score: 1, advantage: 1 }, { participant: "Team C", score: 0, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team D", score: 0, advantage: 1 }, { participant: "Team B", score: 2, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team C", score: 3, advantage: 1 }, { participant: "Team A", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team B", score: 1, advantage: 1 }, { participant: "Team D", score: 0, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team A", score: 2, advantage: 1 }, { participant: "Team D", score: 0, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team B", score: 3, advantage: 1 }, { participant: "Team C", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team B", score: 1, advantage: 1 }, { participant: "Team A", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 6,
        round: 2,
        opponents: [{ participant: "Team D", score: 2, advantage: 1 }, { participant: "Team C", score: 2, advantage: 0 }],
        leg: 0
    },
    // Output soll sein:
    // 1. Team-A   10 Punkte    7:7 Tore
    // 2. Team-C   10 Punkte   10:9 Tore
    // 3. Team-B   10 Punkte    9:6 Tore
    // 4. Team-D    4 Punkte    5:9 Tore
    //
    // Wenn 
    // let sortRule = [
    //  { pos:0, rule:"points", },
    //  { pos:4, rule:"difference" },
    //  { pos:5, rule:"for" },
    //  { pos:1, rule:"points hth", },
    //  { pos:2, rule:"difference hth", },
    //  { pos:3, rule:"for hth", },
    //  { pos:6, rule:"random", }
    // ];
    // Bracket 7 ist zum Testen von mehreren Gruppen mit Punktgleichheit
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team A", score: 0, advantage: 1 }, { participant: "Team B", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team C", score: 0, advantage: 1 }, { participant: "Team D", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team D", score: 2, advantage: 1 }, { participant: "Team A", score: 0, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team C", score: 0, advantage: 1 }, { participant: "Team B", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team A", score: 1, advantage: 1 }, { participant: "Team C", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team D", score: 0, advantage: 1 }, { participant: "Team B", score: 0, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team C", score: 3, advantage: 1 }, { participant: "Team A", score: 3, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team B", score: 1, advantage: 1 }, { participant: "Team D", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team A", score: 0, advantage: 1 }, { participant: "Team D", score: 2, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team B", score: 3, advantage: 1 }, { participant: "Team C", score: 1, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team B", score: 1, advantage: 1 }, { participant: "Team A", score: 0, advantage: 0 }],
        leg: 0
    },
    {
        type: "team",
        game: gameDB,
        tournament: tournamentDB,
        stage: stageDB,
        planned_date: "",
        actual_date: "",
        status: "finished",
        location: "Nizza",
        vids: [],
        bracket: 7,
        round: 2,
        opponents: [{ participant: "Team D", score: 2, advantage: 1 }, { participant: "Team C", score: 1, advantage: 0 }],
        leg: 0
    }
    // Output soll sein:
    // [ { pos: 0,
    //     participant: 'Team D',
    //     played: 6,
    //     won: 4,
    //     draw: 2,
    //     lost: 0,
    //     for: 8,
    //     against: 2,
    //     difference: 6,
    //     points: 14 },
    //   { pos: 1,
    //     participant: 'Team B',
    //     played: 6,
    //     won: 4,
    //     draw: 2,
    //     lost: 0,
    //     for: 7,
    //     against: 2,
    //     difference: 5,
    //     points: 14 },
    //   { pos: 2,
    //     participant: 'Team C',
    //     played: 6,
    //     won: 0,
    //     draw: 2,
    //     lost: 4,
    //     for: 6,
    //     against: 11,
    //     difference: -5,
    //     points: 2 },
    //   { pos: 3,
    //     participant: 'Team A',
    //     played: 6,
    //     won: 0,
    //     draw: 2,
    //     lost: 4,
    //     for: 4,
    //     against: 10,
    //     difference: -6,
    //     points: 2 } ]
];
let st = [
    { name: "A1", bracket: 0, pos: 0 },
    { name: "A2", bracket: 0, pos: 1 },
    { name: "A3", bracket: 0, pos: 2 },
    { name: "A4", bracket: 0, pos: 3 },
    { name: "A5", bracket: 0, pos: 4 },
    { name: "A6", bracket: 0, pos: 5 },
    { name: "A7", bracket: 0, pos: 6 },
    { name: "A8", bracket: 0, pos: 7 },
    { name: "A9", bracket: 0, pos: 8 },
    { name: "A10", bracket: 0, pos: 9 },
    { name: "A11", bracket: 0, pos: 10 },
    { name: "A12", bracket: 0, pos: 11 },
    { name: "A13", bracket: 0, pos: 12 },
    { name: "A14", bracket: 0, pos: 13 },
    { name: "A15", bracket: 0, pos: 14 },
    { name: "A16", bracket: 0, pos: 15 },
    { name: "B1", bracket: 1, pos: 0 },
    { name: "B2", bracket: 1, pos: 1 },
    { name: "B3", bracket: 1, pos: 2 },
    { name: "B4", bracket: 1, pos: 3 },
    { name: "B5", bracket: 1, pos: 4 },
    { name: "B6", bracket: 1, pos: 5 },
    { name: "B7", bracket: 1, pos: 6 },
    { name: "B8", bracket: 1, pos: 7 },
    { name: "B9", bracket: 1, pos: 8 },
    { name: "B10", bracket: 1, pos: 9 },
    { name: "B11", bracket: 1, pos: 10 },
    { name: "B12", bracket: 1, pos: 11 },
    { name: "B13", bracket: 1, pos: 12 },
    { name: "B14", bracket: 1, pos: 13 },
    { name: "B15", bracket: 1, pos: 14 },
    { name: "B16", bracket: 1, pos: 15 },
    { name: "C1", bracket: 2, pos: 0 },
    { name: "C2", bracket: 2, pos: 1 },
    { name: "C3", bracket: 2, pos: 2 },
    { name: "C4", bracket: 2, pos: 3 },
    { name: "C5", bracket: 2, pos: 4 },
    { name: "C6", bracket: 2, pos: 5 },
    { name: "C7", bracket: 2, pos: 6 },
    { name: "C8", bracket: 2, pos: 7 },
    { name: "C9", bracket: 2, pos: 8 },
    { name: "C10", bracket: 2, pos: 9 },
    { name: "C11", bracket: 2, pos: 10 },
    { name: "C12", bracket: 2, pos: 11 },
    { name: "C13", bracket: 2, pos: 12 },
    { name: "C14", bracket: 2, pos: 13 },
    { name: "C15", bracket: 2, pos: 14 },
    { name: "C16", bracket: 2, pos: 15 },
    { name: "D1", bracket: 3, pos: 0 },
    { name: "D2", bracket: 3, pos: 1 },
    { name: "D3", bracket: 3, pos: 2 },
    { name: "D4", bracket: 3, pos: 3 },
    { name: "D5", bracket: 3, pos: 4 },
    { name: "D6", bracket: 3, pos: 5 },
    { name: "D7", bracket: 3, pos: 6 },
    { name: "D8", bracket: 3, pos: 7 },
    { name: "D9", bracket: 3, pos: 8 },
    { name: "D10", bracket: 3, pos: 9 },
    { name: "D11", bracket: 3, pos: 10 },
    { name: "D12", bracket: 3, pos: 11 },
    { name: "D13", bracket: 3, pos: 12 },
    { name: "D14", bracket: 3, pos: 13 },
    { name: "D15", bracket: 3, pos: 14 },
    { name: "D16", bracket: 3, pos: 15 },
    { name: "E1", bracket: 4, pos: 0 },
    { name: "E2", bracket: 4, pos: 1 },
    { name: "E3", bracket: 4, pos: 2 },
    { name: "E4", bracket: 4, pos: 3 },
    { name: "E5", bracket: 4, pos: 4 },
    { name: "E6", bracket: 4, pos: 5 },
    { name: "E7", bracket: 4, pos: 6 },
    { name: "E8", bracket: 4, pos: 7 },
    { name: "E9", bracket: 4, pos: 8 },
    { name: "E10", bracket: 4, pos: 9 },
    { name: "E11", bracket: 4, pos: 10 },
    { name: "E12", bracket: 4, pos: 11 },
    { name: "E13", bracket: 4, pos: 12 },
    { name: "E14", bracket: 4, pos: 13 },
    { name: "E15", bracket: 4, pos: 14 },
    { name: "E16", bracket: 4, pos: 15 },
    { name: "F1", bracket: 5, pos: 0 },
    { name: "F2", bracket: 5, pos: 1 },
    { name: "F3", bracket: 5, pos: 2 },
    { name: "F4", bracket: 5, pos: 3 },
    { name: "F5", bracket: 5, pos: 4 },
    { name: "F6", bracket: 5, pos: 5 },
    { name: "F7", bracket: 5, pos: 6 },
    { name: "F8", bracket: 5, pos: 7 },
    { name: "F9", bracket: 5, pos: 8 },
    { name: "F10", bracket: 5, pos: 9 },
    { name: "F11", bracket: 5, pos: 10 },
    { name: "F12", bracket: 5, pos: 11 },
    { name: "F13", bracket: 5, pos: 12 },
    { name: "F14", bracket: 5, pos: 13 },
    { name: "F15", bracket: 5, pos: 14 },
    { name: "F16", bracket: 5, pos: 15 },
    { name: "G1", bracket: 6, pos: 0 },
    { name: "G2", bracket: 6, pos: 1 },
    { name: "G3", bracket: 6, pos: 2 },
    { name: "G4", bracket: 6, pos: 3 },
    { name: "G5", bracket: 6, pos: 4 },
    { name: "G6", bracket: 6, pos: 5 },
    { name: "G7", bracket: 6, pos: 6 },
    { name: "G8", bracket: 6, pos: 7 },
    { name: "G9", bracket: 6, pos: 8 },
    { name: "G10", bracket: 6, pos: 9 },
    { name: "G11", bracket: 6, pos: 10 },
    { name: "G12", bracket: 6, pos: 11 },
    { name: "G13", bracket: 6, pos: 12 },
    { name: "G14", bracket: 6, pos: 13 },
    { name: "G15", bracket: 6, pos: 14 },
    { name: "G16", bracket: 6, pos: 15 },
    { name: "H1", bracket: 7, pos: 0 },
    { name: "H2", bracket: 7, pos: 1 },
    { name: "H3", bracket: 7, pos: 2 },
    { name: "H4", bracket: 7, pos: 3 },
    { name: "H5", bracket: 7, pos: 4 },
    { name: "H6", bracket: 7, pos: 5 },
    { name: "H7", bracket: 7, pos: 6 },
    { name: "H8", bracket: 7, pos: 7 },
    { name: "H9", bracket: 7, pos: 8 },
    { name: "H10", bracket: 7, pos: 9 },
    { name: "H11", bracket: 7, pos: 10 },
    { name: "H12", bracket: 7, pos: 11 },
    { name: "H13", bracket: 7, pos: 12 },
    { name: "H14", bracket: 7, pos: 13 },
    { name: "H15", bracket: 7, pos: 14 },
    { name: "H16", bracket: 7, pos: 15 },
    { name: "I1", bracket: 8, pos: 0 },
    { name: "I2", bracket: 8, pos: 1 },
    { name: "I3", bracket: 8, pos: 2 },
    { name: "I4", bracket: 8, pos: 3 },
    { name: "I5", bracket: 8, pos: 4 },
    { name: "I6", bracket: 8, pos: 5 },
    { name: "I7", bracket: 8, pos: 6 },
    { name: "I8", bracket: 8, pos: 7 },
    { name: "I9", bracket: 8, pos: 8 },
    { name: "I10", bracket: 8, pos: 9 },
    { name: "I11", bracket: 8, pos: 10 },
    { name: "I12", bracket: 8, pos: 11 },
    { name: "I13", bracket: 8, pos: 12 },
    { name: "I14", bracket: 8, pos: 13 },
    { name: "I15", bracket: 8, pos: 14 },
    { name: "I16", bracket: 8, pos: 15 },
    { name: "J1", bracket: 9, pos: 0 },
    { name: "J2", bracket: 9, pos: 1 },
    { name: "J3", bracket: 9, pos: 2 },
    { name: "J4", bracket: 9, pos: 3 },
    { name: "J5", bracket: 9, pos: 4 },
    { name: "J6", bracket: 9, pos: 5 },
    { name: "J7", bracket: 9, pos: 6 },
    { name: "J8", bracket: 9, pos: 7 },
    { name: "J9", bracket: 9, pos: 8 },
    { name: "J10", bracket: 9, pos: 9 },
    { name: "J11", bracket: 9, pos: 10 },
    { name: "J12", bracket: 9, pos: 11 },
    { name: "J13", bracket: 9, pos: 12 },
    { name: "J14", bracket: 9, pos: 13 },
    { name: "J15", bracket: 9, pos: 14 },
    { name: "J16", bracket: 9, pos: 15 },
    { name: "K1", bracket: 10, pos: 0 },
    { name: "K2", bracket: 10, pos: 1 },
    { name: "K3", bracket: 10, pos: 2 },
    { name: "K4", bracket: 10, pos: 3 },
    { name: "K5", bracket: 10, pos: 4 },
    { name: "K6", bracket: 10, pos: 5 },
    { name: "K7", bracket: 10, pos: 6 },
    { name: "K8", bracket: 10, pos: 7 },
    { name: "K9", bracket: 10, pos: 8 },
    { name: "K10", bracket: 10, pos: 9 },
    { name: "K11", bracket: 10, pos: 10 },
    { name: "K12", bracket: 10, pos: 11 },
    { name: "K13", bracket: 10, pos: 12 },
    { name: "K14", bracket: 10, pos: 13 },
    { name: "K15", bracket: 10, pos: 14 },
    { name: "K16", bracket: 10, pos: 15 },
    { name: "L1", bracket: 11, pos: 0 },
    { name: "L2", bracket: 11, pos: 1 },
    { name: "L3", bracket: 11, pos: 2 },
    { name: "L4", bracket: 11, pos: 3 },
    { name: "L5", bracket: 11, pos: 4 },
    { name: "L6", bracket: 11, pos: 5 },
    { name: "L7", bracket: 11, pos: 6 },
    { name: "L8", bracket: 11, pos: 7 },
    { name: "L9", bracket: 11, pos: 8 },
    { name: "L10", bracket: 11, pos: 9 },
    { name: "L11", bracket: 11, pos: 10 },
    { name: "L12", bracket: 11, pos: 11 },
    { name: "L13", bracket: 11, pos: 12 },
    { name: "L14", bracket: 11, pos: 13 },
    { name: "L15", bracket: 11, pos: 14 },
    { name: "L16", bracket: 11, pos: 15 },
    { name: "M1", bracket: 12, pos: 0 },
    { name: "M2", bracket: 12, pos: 1 },
    { name: "M3", bracket: 12, pos: 2 },
    { name: "M4", bracket: 12, pos: 3 },
    { name: "M5", bracket: 12, pos: 4 },
    { name: "M6", bracket: 12, pos: 5 },
    { name: "M7", bracket: 12, pos: 6 },
    { name: "M8", bracket: 12, pos: 7 },
    { name: "M9", bracket: 12, pos: 8 },
    { name: "M10", bracket: 12, pos: 9 },
    { name: "M11", bracket: 12, pos: 10 },
    { name: "M12", bracket: 12, pos: 11 },
    { name: "M13", bracket: 12, pos: 12 },
    { name: "M14", bracket: 12, pos: 13 },
    { name: "M15", bracket: 12, pos: 14 },
    { name: "M16", bracket: 12, pos: 15 },
    { name: "N1", bracket: 13, pos: 0 },
    { name: "N2", bracket: 13, pos: 1 },
    { name: "N3", bracket: 13, pos: 2 },
    { name: "N4", bracket: 13, pos: 3 },
    { name: "N5", bracket: 13, pos: 4 },
    { name: "N6", bracket: 13, pos: 5 },
    { name: "N7", bracket: 13, pos: 6 },
    { name: "N8", bracket: 13, pos: 7 },
    { name: "N9", bracket: 13, pos: 8 },
    { name: "N10", bracket: 13, pos: 9 },
    { name: "N11", bracket: 13, pos: 10 },
    { name: "N12", bracket: 13, pos: 11 },
    { name: "N13", bracket: 13, pos: 12 },
    { name: "N14", bracket: 13, pos: 13 },
    { name: "N15", bracket: 13, pos: 14 },
    { name: "N16", bracket: 13, pos: 15 },
    { name: "O1", bracket: 14, pos: 0 },
    { name: "O2", bracket: 14, pos: 1 },
    { name: "O3", bracket: 14, pos: 2 },
    { name: "O4", bracket: 14, pos: 3 },
    { name: "O5", bracket: 14, pos: 4 },
    { name: "O6", bracket: 14, pos: 5 },
    { name: "O7", bracket: 14, pos: 6 },
    { name: "O8", bracket: 14, pos: 7 },
    { name: "O9", bracket: 14, pos: 8 },
    { name: "O10", bracket: 14, pos: 9 },
    { name: "O11", bracket: 14, pos: 10 },
    { name: "O12", bracket: 14, pos: 11 },
    { name: "O13", bracket: 14, pos: 12 },
    { name: "O14", bracket: 14, pos: 13 },
    { name: "O15", bracket: 14, pos: 14 },
    { name: "O16", bracket: 14, pos: 15 },
    { name: "P1", bracket: 15, pos: 0 },
    { name: "P2", bracket: 15, pos: 1 },
    { name: "P3", bracket: 15, pos: 2 },
    { name: "P4", bracket: 15, pos: 3 },
    { name: "P5", bracket: 15, pos: 4 },
    { name: "P6", bracket: 15, pos: 5 },
    { name: "P7", bracket: 15, pos: 6 },
    { name: "P8", bracket: 15, pos: 7 },
    { name: "P9", bracket: 15, pos: 8 },
    { name: "P10", bracket: 15, pos: 9 },
    { name: "P11", bracket: 15, pos: 10 },
    { name: "P12", bracket: 15, pos: 11 },
    { name: "P13", bracket: 15, pos: 12 },
    { name: "P14", bracket: 15, pos: 13 },
    { name: "P15", bracket: 15, pos: 14 },
    { name: "P16", bracket: 15, pos: 15 }
];
//# sourceMappingURL=TcUtils.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TournamentCreator_1 = require("../TournamentCreator");
const MatchFactory_1 = require("../matches/MatchFactory");
class StageFactory {
    static createGroupStage(stageConfig, dummyParticipants) {
        let matches;
        let schedulePlan;
        // check input params
        stageConfig.error = TournamentCreator_1.TournamentCreator.validateTournamentArgs(stageConfig.nrGroups, stageConfig.nrParticipants, stageConfig.legs, stageConfig.nrLocations);
        if (stageConfig.error && stageConfig.error.errorCount > 0) {
            return stageConfig;
        }
        let participants = MatchFactory_1.MatchFactory.createTokens(stageConfig.nrParticipants, false, 0, 0, 0);
        // Start Algorithm
        let round = 0;
        TournamentCreator_1.TournamentCreator.Logger.info("== Tournament plan for " + stageConfig.nrGroups + " groups, " + stageConfig.legs + " legs, " + stageConfig.nrLocations + " locations ==\n");
        for (let leg = 0; leg < stageConfig.legs; leg++) {
            //TournamentCreator.Logger.info("--- leg " + leg + " ---\n");
            // Create matches for leg
            matches = MatchFactory_1.MatchFactory.createMatches(participants, stageConfig.order, stageConfig.nrGroups, stageConfig.nrParticipants, dummyParticipants, 0, leg);
            // Schedule matches, separate for each leg
            schedulePlan = stageConfig.scheduleMatches(matches.matchArray, matches.groups, stageConfig.nrGroups, leg, round, 0);
            if (schedulePlan.errors.errorCount !== 0) {
                TournamentCreator_1.TournamentCreator.Logger.error("Error: scheduleMatches() aborts with error!\n");
                stageConfig.error = schedulePlan.errors;
                return stageConfig;
            }
            round = schedulePlan.round;
            round++;
            stageConfig.matches = stageConfig.matches.concat(schedulePlan.scheduledMatches);
        }
        TournamentCreator_1.TournamentCreator.Logger.info('== finished ==\n');
        return stageConfig;
    }
    static createSingleEliminationStage(stageConfig, dummyParticipants) {
        let matches;
        let schedulePlan;
        // check input params
        stageConfig.error = TournamentCreator_1.TournamentCreator.validateTournamentArgs(1, stageConfig.nrParticipants, stageConfig.legs, stageConfig.nrLocations);
        if (stageConfig.error && stageConfig.error.errorCount > 0) {
            return stageConfig;
        }
        let participants = MatchFactory_1.MatchFactory.createTokens(stageConfig.nrParticipants, false, 0, 0, 0);
        // find next multiple of 2; maximal participants must be greather or equal to nrParticipants
        // z.B. wenn nrParticipants=6, dann braucht man 8-tel Finale => participantSlotsInStage=8
        //      es gibt also participantSlotsInStage/2 = 8/2 = 4 maximale Matches.
        //      Es setzen in der ersten Stage participantSlotsInStage-nrParticipants = 8-6 = 2 Matches aus,
        //      d.h. es gibt also nrMatchesInStage = participantSlotsInStage/2 - (participantSlotsInStage-nrParticipants) = 4-(8-6) = 2 Matches in aktueller Stage
        let participantSlotsInStage = 1;
        while (stageConfig.nrParticipants > participantSlotsInStage) {
            participantSlotsInStage *= 2;
        }
        let nrPhases = Math.ceil(Math.log(participantSlotsInStage) * Math.LOG2E);
        if (stageConfig.thirdPlaceMatch)
            nrPhases++;
        let nrGroups = participantSlotsInStage / 2;
        // Overwrite nrGroups by correct one
        stageConfig.nrGroups = nrGroups;
        let round = 0;
        TournamentCreator_1.TournamentCreator.Logger.info("== Tournament plan for single-elimination, " + (participantSlotsInStage / 2) + "-th final, " + stageConfig.legs + " legs, " + stageConfig.nrLocations + " locations ==\n");
        // Start Algorithm
        for (let phase = 0; phase < nrPhases; phase++) {
            if (phase === nrPhases - 2 && stageConfig.thirdPlaceMatch) {
                // final
                stageConfig.legs = 1; // final match is always only one match!
                participantSlotsInStage = 2;
                if (stageConfig.thirdPlaceMatch) {
                    round++; // final should be the last game, thirdPlaceMatch before
                }
            }
            else if (phase === nrPhases - 1 && stageConfig.thirdPlaceMatch) {
                // thirdPlaceMatch
                stageConfig.legs = 1; // third place match is always only one match!
                participantSlotsInStage = 2;
                round = round - 2; // final should be the last game, thirdPlaceMatch before
                round = Math.max(0, round);
            }
            else if (phase === nrPhases - 1 && !stageConfig.thirdPlaceMatch) {
                // final
                stageConfig.legs = 1; // final match is always only one match!
                participantSlotsInStage = 2;
            }
            nrGroups = participantSlotsInStage / 2;
            if (phase > 0) {
                // After first stages, no participant can be set, so fill all following participants with empty objects
                participants = MatchFactory_1.MatchFactory.createTokens(participantSlotsInStage, false, 0, 0, 0);
            }
            for (let leg = 0; leg < stageConfig.legs; leg++) {
                // Create matches for leg
                // participantSlotsInStage is bei nrParticipants 7 -> 8
                matches = MatchFactory_1.MatchFactory.createMatches(participants, stageConfig.order, nrGroups, participantSlotsInStage, dummyParticipants, phase, leg);
                // Schedule matches, separate for each leg
                schedulePlan = stageConfig.scheduleMatches(matches.matchArray, matches.groups, nrGroups, leg, round, phase);
                if (schedulePlan.errors.errorCount !== 0) {
                    TournamentCreator_1.TournamentCreator.Logger.error("Error: scheduleMatches() aborts with error!\n");
                    stageConfig.error = schedulePlan.errors;
                    return stageConfig;
                }
                round = schedulePlan.round;
                round++;
                stageConfig.matches = stageConfig.matches.concat(schedulePlan.scheduledMatches);
            }
            participantSlotsInStage /= 2;
        }
        TournamentCreator_1.TournamentCreator.Logger.info('== finished ==\n');
        return stageConfig;
    }
}
exports.StageFactory = StageFactory;
//# sourceMappingURL=StageFactory.js.map
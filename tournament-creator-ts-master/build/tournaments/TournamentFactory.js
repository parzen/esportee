"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TournamentCreator_1 = require("../TournamentCreator");
const StageFactory_1 = require("../stages/StageFactory");
class TournamentFactory {
    static createTournament(userInput, dummyParticipants) {
        let stageOrder = 0; // stages order over full tournament
        let round = 0;
        let result;
        let onlineTournament = userInput.type == 'online';
        // Create stages
        for (let stageConfig of userInput.stageConfigs) {
            // clean stage
            stageConfig.clean();
            TournamentCreator_1.TournamentCreator.Logger.info("Create " + userInput.type + " " + stageConfig.stageType + "-tournament with args:");
            TournamentCreator_1.TournamentCreator.Logger.info(JSON.stringify(stageConfig));
            switch (stageConfig.stageType) {
                case "GROUP":
                    // Create new group tournament
                    result = StageFactory_1.StageFactory.createGroupStage(stageConfig, dummyParticipants, round, userInput.venues, onlineTournament);
                    stageConfig.matches = result.stageConfig.matches;
                    stageConfig.name = "Group Stage";
                    round = result.round;
                    break;
                case "SINGLE_ELIMINATION":
                    // Create new single-elimination tournament
                    result = StageFactory_1.StageFactory.createSingleEliminationStage(stageConfig, dummyParticipants, round, userInput.venues, onlineTournament);
                    stageConfig.matches = result.stageConfig.matches;
                    stageConfig.name = "Elimination Stage";
                    round = result.round;
                    break;
                case "LEAGUE":
                case "SWISS":
                case "DOUBLE_ELIMINATION":
                case "GROUP_BRACKET":
                    TournamentCreator_1.TournamentCreator.Logger.error("Error: StageType '" + stageConfig.stageType + "' not implemented yet!");
                    // TODO: throw error
                    break;
                default:
                    TournamentCreator_1.TournamentCreator.Logger.error("Error: Unknown stageType '" + stageConfig.stageType + "'!");
                    // TODO: throw error
                    break;
            }
            //TournamentCreator.Logger.info("match plan: ");
            //TournamentCreator.Logger.info(JSON.stringify(stageConfig.matches));
            // Prepare next stages
            // stageConfig.order = stageConfig.order ? stageConfig.order : stageOrder;
            stageConfig.order = stageOrder;
            stageOrder = stageOrder + 1;
        }
        return userInput;
    }
}
exports.TournamentFactory = TournamentFactory;
//# sourceMappingURL=TournamentFactory.js.map
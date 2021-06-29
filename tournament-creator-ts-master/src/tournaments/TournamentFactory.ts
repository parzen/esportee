import {TournamentConfig} from "./TournamentConfig";
import {TournamentCreator} from "../TournamentCreator";
import {StageFactory} from "../stages/StageFactory";
import {ITournamentConfig} from "../interfaces/ITournamentConfig";
export class TournamentFactory {
    public static createTournament(userInput: TournamentConfig, dummyParticipants: boolean): ITournamentConfig {
        let stageOrder = 0; // stages order over full tournament
        let round = 0;
        let result;
        let onlineTournament = userInput.type == 'online';

        // Create stages
        for (let stageConfig of userInput.stageConfigs) {           
            // clean stage
            stageConfig.clean();

            TournamentCreator.Logger.info("Create " + userInput.type + " " + stageConfig.stageType + "-tournament with args:");
            TournamentCreator.Logger.info(JSON.stringify(stageConfig));

            switch (stageConfig.stageType) {
                case "GROUP":
                    // Create new group tournament
                    result = StageFactory.createGroupStage(stageConfig, dummyParticipants, round, userInput.venues, onlineTournament);
                    stageConfig.matches = result.stageConfig.matches;
                    stageConfig.name = "Group Stage";
                    round = result.round;
                    break;
                case "SINGLE_ELIMINATION":
                    // Create new single-elimination tournament
                    result = StageFactory.createSingleEliminationStage(stageConfig, dummyParticipants, round, userInput.venues, onlineTournament);
                    stageConfig.matches = result.stageConfig.matches;
                    stageConfig.name = "Elimination Stage";
                    round = result.round;
                    break;
                case "LEAGUE":
                case "SWISS":
                case "DOUBLE_ELIMINATION":
                case "GROUP_BRACKET":
                    TournamentCreator.Logger.error("Error: StageType '" + stageConfig.stageType + "' not implemented yet!");
                    // TODO: throw error
                    break;
                default:
                    TournamentCreator.Logger.error("Error: Unknown stageType '" + stageConfig.stageType + "'!");
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
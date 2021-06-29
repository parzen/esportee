import {IStageConfig} from "../interfaces/IStageConfig";
import {ITournamentConfig} from "../interfaces/ITournamentConfig";
import {StringUtils} from "../utils/StringUtils";
import {StageType} from "../stages/StageType";
import {StageConfig} from "../stages/StageConfig";
import { TcUtils } from "../utils/TcUtils";
import {Venue} from "../interfaces/IReturnObjects";

export class TournamentConfig implements ITournamentConfig {
    id: number;
    name: string;
    status: string;
    userId: number;
    gameId: number;
    gameSettings: {};
    isATeamTournament: boolean;
    venues: Venue[];
    type: string;
    address: {};
    startDate: Date;
    checkinDateStart: Date;
    checkinDateEnd: Date;
    stageConfigs: IStageConfig[];

    constructor(model?: ITournamentConfig, venues?: Venue[]) {
        if (model !== undefined) {
            this.id = model.id;
            this.name = model.name;
            this.status = model.status;
            this.userId = model.userId;
            this.gameId = model.gameId;
            this.gameSettings = model.gameSettings;
            this.isATeamTournament = model.isATeamTournament;
            this.venues = venues;
            this.type = model.type;
            this.address = model.address;
            this.startDate = model.startDate;
            this.checkinDateStart = model.checkinDateStart;
            this.checkinDateEnd = model.checkinDateEnd;
            if (model.stageConfigs != null) {
                let result: StageConfig[] = [];
                for (let i = 0; i < model.stageConfigs.length; i++) {
                    result.push(new StageConfig(model.stageConfigs[i]));
                }
                this.stageConfigs = result;
            }
        }
    }

    static validate(config: ITournamentConfig): { [s: string]: { [s: string]: string } } {
        let errors: { [s: string]: { [s: string]: string } } = {};

        if (config.type == "offline") {
            if (!config.venues || config.venues.length == 0) {
                errors[0] = {};
                errors[0]["venues"] = "Venues must be at least 1.";
            }
        }
        
        let idx = 0;
        for (let stage of config.stageConfigs) {
            errors[idx] = {};
            if (StringUtils.isEmpty(stage.name) || StringUtils.isBlank(stage.name)) {
                errors[idx]["name"] = "Name is required.";
            }
            if (StringUtils.isEmpty(stage.stageType) || StageType.getValues().indexOf(stage.stageType.toString()) < 0) {
                errors[idx]["type"] = "Stage type is required.";
            }
            if (stage.nrParticipants < 2) {
                errors[idx]["nrParticipants"] = "Number of participants must be at least 2.";
            }
            if (stage.legs < 1) {
                errors[idx]["nrLegs"] = "Number of legs must be at least 1.";
            }
            if (stage.nrGroups < 1 && stage.stageType == StageType.GROUP) {
                errors[idx]["nrGroups"] = "Number of groups must be at least 1.";
            }
            if (!StringUtils.isEmpty(stage.stageType)) {
                if (stage.stageType == StageType.SINGLE_ELIMINATION || stage.stageType == StageType.DOUBLE_ELIMINATION) {
                    if (stage.thirdPlaceMatch == undefined) {
                        errors[idx]["thirdPlaceMatch"] = "Third place match must be set.";
                    }
                }
            }

            // TODO: right now only up to 25 participants are working with tournament algorithm
            if (stage.nrParticipants / (stage.nrGroups > 0 ? stage.nrGroups : 1) >= 25) {
                errors[idx]["nrParticipants"] = "Number of participants must be lower than 25.";
            }
            if (stage.nrParticipants < 4 && stage.thirdPlaceMatch && stage.stageType == StageType.SINGLE_ELIMINATION) {
                errors[idx]["nrParticipants"] = "Number of participants must be at least 4 with third place match.";
            }

            // Check stage->nextStage combination
            if (idx < config.stageConfigs.length-1) {
                let nextStage = config.stageConfigs[idx+1];
                if (TcUtils.checkNextStageCombination(stage, nextStage) != true) {
                    errors[idx]["nextStageCombination"] = "The combination between this and next stage is not supported yet.";
                }
            }

            if (Object.keys(errors[idx]).length === 0) {
                delete errors[idx];
            }

            idx++;
        }

        return errors;
    }
}
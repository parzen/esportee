"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UIDUtils_1 = require("../utils/UIDUtils");
const StringUtils_1 = require("../utils/StringUtils");
const StageType_1 = require("../stages/StageType");
const StageConfig_1 = require("../stages/StageConfig");
class TournamentConfig {
    constructor(model) {
        this.id = UIDUtils_1.UIDUtils.getUid();
        if (model !== undefined) {
            this.id = model.id;
            this.userId = 0; // is set on server
            this.stageConfigs = model.stageConfigs;
            this.name = model.name;
            this.status = model.status;
            this.gameId = model.gameId;
            if (model.stageConfigs != null) {
                let result = [];
                for (let i = 0; i < model.stageConfigs.length; i++) {
                    result.push(new StageConfig_1.StageConfig(model.stageConfigs[i]));
                }
                this.stageConfigs = result;
            }
        }
    }
    static validate(config) {
        let errors = {};
        errors[config.id] = {};
        if (StringUtils_1.StringUtils.isEmpty(config.name) || StringUtils_1.StringUtils.isBlank(config.name)) {
            errors[config.id]["tournamentName"] = "Tournament name is required.";
        }
        for (let stage of config.stageConfigs) {
            errors[stage.id] = {};
            if (StringUtils_1.StringUtils.isEmpty(stage.name) || StringUtils_1.StringUtils.isBlank(stage.name)) {
                errors[stage.id]["name"] = "Name is required.";
            }
            if (StringUtils_1.StringUtils.isEmpty(stage.stageType) || StageType_1.StageType.getValues().indexOf(stage.stageType.toString()) < 0) {
                errors[stage.id]["type"] = "Stage type is required.";
            }
            if (stage.nrParticipants < 2) {
                errors[stage.id]["nrParticipants"] = "Number of participants must be at least 2.";
            }
            if (stage.legs < 1) {
                errors[stage.id]["nrLegs"] = "Number of legs must be at least 1.";
            }
            if (stage.nrLocations < 1) {
                errors[stage.id]["nrLocations"] = "Number of locations must be at least 1.";
            }
            if (stage.nrGroups < 1 && stage.stageType == StageType_1.StageType.GROUP) {
                errors[stage.id]["nrGroups"] = "Number of groups must be at least 1.";
            }
            if (!StringUtils_1.StringUtils.isEmpty(stage.stageType)) {
                if (stage.stageType == StageType_1.StageType.SINGLE_ELIMINATION || stage.stageType == StageType_1.StageType.DOUBLE_ELIMINATION) {
                    if (stage.thirdPlaceMatch == undefined) {
                        errors[stage.id]["thirdPlaceMatch"] = "Third place match must be set.";
                    }
                }
            }
            // TODO: right now only up to 25 participants are working with tournament algorithm
            if (stage.nrParticipants / (stage.nrGroups > 0 ? stage.nrGroups : 1) >= 25) {
                errors[stage.id]["nrParticipants"] = "Number of participants must be lower than 25.";
            }
            if (stage.nrParticipants < 4 && stage.thirdPlaceMatch && stage.stageType == StageType_1.StageType.SINGLE_ELIMINATION) {
                errors[stage.id]["nrParticipants"] = "Number of participants must be at least 4 with third place match.";
            }
            if (Object.keys(errors[stage.id]).length === 0) {
                delete errors[stage.id];
            }
        }
        if (Object.keys(errors[config.id]).length === 0) {
            delete errors[config.id];
        }
        return errors;
    }
}
exports.TournamentConfig = TournamentConfig;
//# sourceMappingURL=TournamentConfig.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StageType {
    static getValues() {
        return [StageType.GROUP, StageType.SINGLE_ELIMINATION, StageType.DOUBLE_ELIMINATION, StageType.SWISS, StageType.LEAGUE, StageType.GROUP_BRACKET];
    }
}
StageType.GROUP = "GROUP";
StageType.SINGLE_ELIMINATION = "SINGLE_ELIMINATION";
StageType.DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION";
StageType.SWISS = "SWISS";
StageType.LEAGUE = "LEAGUE";
StageType.GROUP_BRACKET = "GROUP_BRACKET";
exports.StageType = StageType;
//# sourceMappingURL=StageType.js.map
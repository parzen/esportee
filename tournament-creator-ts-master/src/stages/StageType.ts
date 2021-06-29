export class StageType {
    static GROUP = "GROUP";
    static SINGLE_ELIMINATION = "SINGLE_ELIMINATION";
    static DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION";
    static SWISS = "SWISS";
    static LEAGUE = "LEAGUE";
    static GROUP_BRACKET = "GROUP_BRACKET";

    static getValues(): string[] {
        return [StageType.GROUP, StageType.SINGLE_ELIMINATION, StageType.DOUBLE_ELIMINATION, StageType.SWISS, StageType.LEAGUE, StageType.GROUP_BRACKET];
    }
}
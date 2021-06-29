import {
    IMatch,
    IMatchToken,
    IStageConfig,
    ITournamentValidationError,
    previewArray,
    schedulePlan,
    sortRule,
    StageType,
    tableEntry
} from "tournament-creator-ts";
import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {TournamentConfig} from "./TournamentConfig";
import {Match} from "./Match";

@Entity()
export class StageConfig implements IStageConfig {
    clean() {
        throw new Error("Method not implemented.");
    }

    updateNextStage(nextStage: IStageConfig, matches: IMatch[]) {
        throw new Error("do not call from entity");
    }

    getPreviewArray(pseudoTeamNames: boolean): previewArray[] {
        throw new Error("do not call from entity");
    }

    getSortedTableForBracket(bracket: number, sortRule: sortRule[]): tableEntry[] {
        throw new Error("do not call from entity");
    }

    getSortedTableForAllBrackets(sortRule: sortRule[]): [tableEntry[]] {
        throw new Error("do not call from entity");
    }

    error: ITournamentValidationError;

    @Column()
    order: number;

    scheduleMatches(matchArray: [[IMatchToken[]]], groups: [IMatchToken[]], nrGroups: number, leg: number, round: number, phase: number): schedulePlan {
        throw new Error("do not call from entity");
    }

    @Column("json")
    stageType: StageType;

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    nrParticipants: number;

    @Column()
    legs: number;

    @Column()
    nrGroups: number;

    @Column()
    thirdPlaceMatch: boolean;

    @OneToMany(type => Match, match => match.stage, {
        cascade : true
    })
    matches: Match[];

    @ManyToOne(type => TournamentConfig, tournamentConfig => tournamentConfig.stageConfigs)
    config: TournamentConfig;
}
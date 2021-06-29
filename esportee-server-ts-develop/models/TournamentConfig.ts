/**
 * Created by marco on 14.04.17.
 */
import {ITournamentConfig} from "tournament-creator-ts";
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {StageConfig} from "./StageConfig";
import {Invitation} from "./Invitation";
import {ParticipantStat} from "./ParticipantStat";

@Entity()
export class TournamentConfig implements ITournamentConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(type => StageConfig, stageConfig => stageConfig.config, {
        cascade: true
    })
    stageConfigs: StageConfig[];

    @Column()
    name: string;

    @Column()
    userId: number;

    @Column({default: "pending"})
    status: string;

    @Column()
    gameId: number;

    @Column("simple-json")
    gameSettings: {};

    @Column()
    isATeamTournament: boolean;

    @Column()
    type: string; // online or offline

    @Column("simple-json")
    address: {};

    @Column({type: Date})
    startDate: Date;

    @Column({type: Date})
    checkinDateStart: Date;

    @Column({type: Date})
    checkinDateEnd: Date;

    @OneToMany(type => ParticipantStat, participantStat => participantStat.tournamentConfig, {
        cascade: true
    })
    participantStats: ParticipantStat[];

    @OneToMany(type => Invitation, token => token.tournamentConfig, {
        cascade: true
    })
    invitations: Invitation[];

    @Column({type: Number, array: true})
    venueIds: number[];

    validate(config: TournamentConfig) {
        //TournamentConfig.validate(config);
    }
}
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Team} from "./Team";
import {User} from "./User";
import {TournamentConfig} from "./TournamentConfig";

@Entity()
export class ParticipantStat {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.participantStat)
    user: User;

    @ManyToOne(type => Team, team => team.participantStat)
    team: Team;

    @ManyToOne(type => TournamentConfig, cfg => cfg.participantStats)
    tournamentConfig: TournamentConfig;

    @Column()
    rank: number;

    @Column()
    played: number;

    @Column()
    won: number;

    @Column()
    draw: number;

    @Column()
    lost: number;

    @Column()
    for: number;

    @Column()
    against: number;
}
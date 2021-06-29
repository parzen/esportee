import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "./User";
import {Team} from "./Team";
import {TournamentConfig} from "./TournamentConfig";

export enum InvitationType {
    ADD_USER_TOURNAMENT,
    ADD_TEAM_TOURNAMENT,
    JOIN_TEAM,
    REGISTER_USER_TOURNAMENT,
    REGISTER_TEAM_TOURNAMENT
}

@Entity()
export class Invitation {
    @PrimaryColumn({length: 256})
    token: string;

    @ManyToOne(type => TournamentConfig, config => config.invitations)
    tournamentConfig: TournamentConfig;

    @ManyToOne(type => User, user => user.invitations)
    user: User;

    @ManyToOne(type => Team, team => team.invitations)
    team: Team;

    @Column({default: "pending"})
    status: string;

    @Column()
    invitationType: InvitationType
}
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ParticipantStat} from "./ParticipantStat";
import {Invitation} from "./Invitation";
import {MatchToken} from "./MatchToken";
import {Teammember} from "./Teammember";

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50, unique: true})
    name: string;

    @OneToMany(type => Teammember, teammember => teammember.team, {
        cascade: true
    })
    teammembers: Teammember[];

    @OneToMany(type => Invitation, invitation => invitation.team, {
        cascade: true
    })
    invitations: Invitation[];

    @OneToMany(type => MatchToken, opponent => opponent.match, {
        cascade: true
    })
    matchTokens: MatchToken[];

    @OneToMany(type => ParticipantStat, participantStat => participantStat.team, {
        cascade: true
    })
    participantStat: ParticipantStat[];
}
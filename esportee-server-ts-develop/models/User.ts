import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {MatchToken} from "./MatchToken";
import {Invitation} from "./Invitation";
import {Teammember} from "./Teammember";
import {ParticipantStat} from "./ParticipantStat";
import {Venue} from "./Venue";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50, unique: true})
    username: string;

    @Column({length: 100, unique: true})
    email: string;

    @Column()
    password: string;

    @Column({nullable: true, type: Date})
    lastlogin: Date;

    @Column()
    userLevel: number;

    @OneToMany(type => MatchToken, opponent => opponent.match, {
        cascade: true
    })
    matchTokens: MatchToken[];

    @OneToMany(type => Teammember, teammember => teammember.user, {
        cascade: true
    })
    teammembers: Teammember[];

    @OneToMany(type => Invitation, user => user.user, {
        cascade: true
    })
    invitations: Invitation[];

    @OneToMany(type => ParticipantStat, participantStat => participantStat.user, {
        cascade: true
    })
    participantStat: ParticipantStat[];

    @OneToMany(type => Venue, venue => venue.user, {
        cascade: true
    })
    venues: Venue[];

    @Column({nullable: true})
    fcmToken?: string;

    getInfo(): Object {
        let info = Object.create(null);
        info.id = this.id;
        info.username = this.username;
        info.email = this.email;
        info.lastlogin = this.lastlogin;
        info.userLevel = this.userLevel;
        return info;
    }
}


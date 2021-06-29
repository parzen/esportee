import {Column, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {IMatchToken} from "tournament-creator-ts";
import {Match} from "./Match";
import {Entity} from "typeorm/decorator/entity/Entity";
import {User} from "./User";
import {Team} from "./Team";

@Entity()
export class MatchToken implements IMatchToken {

    @Column()
    token: string;

    @Column()
    score: number;

    @Column()
    advantage: number;

    @Column({nullable: true, type: Date})
    resultApprovedTimestamp: Date;

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Match, match => match.opponents)
    match: Match;

    @ManyToOne(type => User, user => user.matchTokens)
    user: User;

    @ManyToOne(type => Team, team => team.matchTokens)
    team: Team;
}
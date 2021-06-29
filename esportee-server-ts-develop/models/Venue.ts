import {Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany} from "typeorm";
import {User} from "./User";
import {Match} from "./Match";

@Entity()
export class Venue {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100})
    name: string;

    @ManyToOne(type => User, user => user.venues)
    user: User;

    @OneToMany(type => Match, match => match.venue)
    matches: Match[];
}


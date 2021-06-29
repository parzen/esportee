import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Team} from "./Team";
import {User} from "./User";

@Entity()
export class Teammember {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.teammembers)
    user: User;

    @Column({type: Date, array: true})
    joinDate: Date[];

    @Column({type: Date, array: true})
    quitDate: Date[];

    @ManyToOne(type => Team, team => team.teammembers)
    team: Team;
}
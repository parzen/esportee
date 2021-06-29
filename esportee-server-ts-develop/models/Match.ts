import {IMatch} from "tournament-creator-ts";
import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {StageConfig} from "./StageConfig";
import {MatchToken} from "./MatchToken";
import {Venue} from "./Venue";

@Entity()
export class Match implements IMatch {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => StageConfig, stage => stage.matches)
    stage: StageConfig;

    @Column()
    status: number;

    @ManyToOne(type => Venue, venue => venue.matches)
    venue: Venue;

    @Column()
    bracket: number;

    @Column()
    round: number;

    @OneToMany(type => MatchToken, opponent => opponent.match, {
        cascade: true
    })
    opponents: MatchToken[];

    @Column()
    leg: number;

    @Column()
    phase: number;

    validate(): { [s: string]: string } {
        let errors: { [s: string]: string } = {};
        for (let opponent of this.opponents) {
            if (opponent.score < 0) {
                errors = {"invalid_config": "Score is lower than 0"};
                break;
            }
        }
        return errors;
    }
}

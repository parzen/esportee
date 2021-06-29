import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {AppInstance} from "../app";

@Entity()
export class Game {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100, unique: true})
    title: string;

    @Column({length: 30, unique: true})
    shortName: string;

    @Column()
    description: string;

    @Column()
    studio: string;

    @Column()
    publisher: string;

    @Column()
    urlParam: string;

    @Column()
    genre: string;

    @Column()
    ageRating: string;

    @Column("simple-json")
    settings: {};

    static seed() {
        let fifa16 = new Game();
        fifa16.title = "FIFA 16";
        fifa16.shortName = "FIFA 16";
        fifa16.urlParam = "fifa16";
        fifa16.studio = "EA Canada";
        fifa16.publisher = "EA Sports";
        fifa16.genre = "Soccer";
        fifa16.ageRating = "3";
        fifa16.description = "FIFA 16 is an association football simulation video game developed by EA Canada and published by EA Sports for Microsoft Windows, PlayStation 3, PlayStation 4, Xbox 360, Xbox One, Android and iOS.";
        fifa16.settings = { "Mode": "FIFA Ultimate Team", "Half Length": "6 minutes", "Controls": "Any", "Game Speed": "Normal", "Squad Type": "Online" };
        AppInstance.entityManager.save(Game, fifa16).catch(error => {
            // Nothing to do
        });

        let fifa18 = new Game();
        fifa18.title = "FIFA 18";
        fifa18.shortName = "FIFA 18";
        fifa18.urlParam = "fifa18";
        fifa18.studio = "EA Canada";
        fifa18.publisher = "EA Sports";
        fifa18.genre = "Soccer";
        fifa18.ageRating = "3";
        fifa18.description = "FIFA 18 is an association football simulation video game developed by EA Canada and published by EA Sports for Microsoft Windows, PlayStation 3, PlayStation 4, Xbox 360, Xbox One, Android and iOS.";
        fifa18.settings = { "Mode": "FIFA Ultimate Team", "Half Length": "6 minutes", "Controls": "Any", "Game Speed": "Normal", "Squad Type": "Online" };
        AppInstance.entityManager.save(Game, fifa18).catch(error => {
            // Nothing to do
        });
    }
}


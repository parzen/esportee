import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class ConfirmationToken {
    @Column({length: 256})
    token: string;

    @PrimaryColumn()
    email: string;

    @Column({type: Date})
    validuntil: Date;
}
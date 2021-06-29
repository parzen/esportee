import {IsAlphanumeric, IsDate, IsEmail, Length, MinLength} from "class-validator";
import {User} from "../../../models/User";
import * as bcrypt from "bcrypt";
import {UserLevel} from "../../../models/UserLevel";

export class UserParam {
    static MIN_PASSWORD_LENGTH = 6;

    @IsAlphanumeric()
    @Length(3, 18)
    username: string;

    @IsEmail()
    email: string;

    @MinLength(UserParam.MIN_PASSWORD_LENGTH)
    password: string;

    toUser(): Promise<User> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(this.password, 10).then(
                hash => {
                    let newUser = new User();
                    newUser.password = hash;
                    newUser.username = this.username;
                    newUser.email = this.email;
                    newUser.userLevel = UserLevel.UNCONFIRMED;
                    newUser.lastlogin = new Date();
                    resolve(newUser);
                }
            ).catch(
                error => reject(error)
            )
        });
    }
}
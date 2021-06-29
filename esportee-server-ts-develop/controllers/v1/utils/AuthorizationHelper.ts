import {AppInstance} from "../../../app";
import {User} from "../../../models/User";
import * as bcrypt from "bcrypt";
import {Token} from "../entities/Token";
import {ApiResponse} from "../entities/responses/ApiResponse";
import * as jwt from "jsonwebtoken";
import {AuthError} from "../entities/responses/AuthError";
import {InternalServerError} from "../entities/responses/InternalServerError";
import {UserLevel} from "../../../models/UserLevel";
import {RecaptchChallenge} from "../entities/RecaptchChallenge";
import {SuccessResponse} from "../entities/responses/SuccessResponse";
const randtoken = require('rand-token');
const recaptcha = require('node-recaptcha2');

var refreshtokens: { [token: string]: number } = {};

export class AuthorizationHelper {
    static authorize(email, password): Promise<ApiResponse> {
        return new Promise<ApiResponse>((resolve, reject) => {
            AppInstance.entityManager.findOne(User, {email: email})
                .then(user => {
                    if (user != null) {
                        if (user.userLevel === UserLevel.UNCONFIRMED) {
                            resolve(new AuthError("email unconfirmed"));
                        } else if (user.userLevel === UserLevel.BLOCKED) {
                            resolve(new AuthError("account blocked"))
                        } else {
                            bcrypt.compare(password, user.password)
                                .then(valid => {
                                    if (valid) {
                                        var token = jwt.sign({'userid': user.id}, AppInstance.config["jwt-secret"], {expiresIn: "30 days"});
                                        var refreshToken = randtoken.uid(256);
                                        refreshtokens[refreshToken] = user.id;
                                        resolve(new SuccessResponse({
                                            user_id: user.id,
                                            token: new Token(token, refreshToken)
                                        }));
                                    } else {
                                        reject(new AuthError("invalid password"));
                                    }
                                }).catch(
                                error => {
                                    reject(new InternalServerError(error));
                                }
                            );
                        }
                    } else {
                        reject(new AuthError("unknown user"));
                    }
                })
                .catch(reason => {
                    reject(new InternalServerError());
                });
        });
    }

    static refreshToken(refreshtokenOld: string, userid: string): Promise<ApiResponse> {
        return new Promise((resolve, reject) => {
            if (refreshtokens[userid] !== null) {
                if (Number.parseInt(userid) === refreshtokens[refreshtokenOld]) {
                    var token = jwt.sign({'userid': userid}, AppInstance.config["jwt-secret"], {expiresIn: 300});
                    var refreshToken = randtoken.uid(256);
                    refreshtokens[userid] = refreshToken;
                    resolve(new ApiResponse(true, new Token(token, refreshToken)));
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }

    static validateJWTToken(token: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (token) {
                jwt.verify(token, AppInstance.config["jwt-secret"], function (err, decoded) {
                    if (err !== null) {
                        reject(false);
                    } else {
                        try {
                            resolve(decoded["userid"]);
                        } catch (error) {
                            reject(error);
                        }
                    }
                });
            } else {
                reject();
            }
        });
    }

    static validateRecaptcha(challenge: RecaptchChallenge): Promise<Boolean> {
        // TODO: NEVER TESTED -> Test it!
        return new Promise<Boolean>((resolve, reject) => {
            if (challenge === null) {
                reject();
            } else {
                var data = {
                    response: challenge.response
                };
                var recaptcha = new recaptcha.Recaptcha(AppInstance.config["recaptcha"].publicKey, AppInstance.config["recaptcha"].privateKey, data);

                recaptcha.verify(function (success, error_code) {
                    if (success) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            }
        });
    }
}
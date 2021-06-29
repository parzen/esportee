import {
    Body,
    BodyParam,
    Delete,
    Get,
    JsonController,
    Param,
    Post,
    Put,
    QueryParam,
    Req,
    UseBefore
} from "routing-controllers";
import {UserParam} from "./entities/UserParam";
import {AppInstance} from "../../app";
import {User} from "../../models/User";
import {FindManyOptions} from "typeorm";
import {AuthorizationHelper} from "./utils/AuthorizationHelper";
import {InternalServerError} from "./entities/responses/InternalServerError";
import * as validator from "validator";
import {BadRequest} from "./entities/responses/BadRequest";
import {ForbiddenError} from "./entities/responses/ForbiddenError";
import {RecaptchChallenge} from "./entities/RecaptchChallenge";
import {ApiResponse} from "./entities/responses/ApiResponse";
import {ConfirmationToken} from "../../models/ConfirmationToken";
import {UserLevel} from "../../models/UserLevel";
import {SuccessResponse} from "./entities/responses/SuccessResponse";
import {AuthorizationMiddleware} from "./utils/AuthorizationMiddleware";

const randtoken = require('rand-token');

@JsonController()
export class UserController {

    @Get("/users/list/:options")
    getAll(@Param("options") options?: FindManyOptions<User>) {
        return AppInstance.entityManager.findAndCount(User, options);
    }

    @Get("/users/id/:id")
    @UseBefore(AuthorizationMiddleware)
    getOne(@Param("id") id: number) {
        return AppInstance.entityManager.findByIds(User, [id])
            .then((users) => new SuccessResponse(users[0].getInfo()))
            .catch((error) => new InternalServerError());
    }

    @Post("/users/updatefcm")
    @UseBefore(AuthorizationMiddleware)
    updateFcm(@BodyParam("token") token: string, @Req() request: any) {
        return new Promise((resolve, reject) => {
            let user = request.authenticatedUser;
            if (user != null) {
                return AppInstance.connection.getRepository(User)
                    .findOne(user)
                    .then(user => {
                        user.fcmToken = token;
                        AppInstance.connection.getRepository(User)
                            .save(user).then(() => resolve(new SuccessResponse(true)))
                            .catch(() => resolve(new InternalServerError()))
                    }).catch(() => resolve(new InternalServerError()))
            } else {
                resolve(new BadRequest("user unknown"));
            }
        });
    }

    @Post("/users")
    post(@BodyParam("user") param: UserParam, @BodyParam("challenge") challenge?: RecaptchChallenge) {
        if (AppInstance.config.env === "production") {
            if (challenge === null) {
                return new BadRequest("challenge missing");
            } else {
                return new Promise((resolve, reject) => {
                    AuthorizationHelper.validateRecaptcha(challenge).then(
                        valid => {
                            if (valid) {
                                this.createUser(param).then(
                                    response => {
                                        this.confirmationCodeResponse(param, resolve, response);
                                    }
                                ).catch(error => {
                                    resolve(error);
                                });
                            } else {
                                resolve(new BadRequest("challenge failed"));
                            }
                        }
                    ).catch(
                        error => {
                            if (AppInstance.config.env === 'development') {
                                resolve(new InternalServerError(error));
                            } else {
                                resolve(new InternalServerError());
                            }
                        }
                    )
                });
            }
        } else {
            return new Promise((resolve, reject) => {
                this.createUser(param).then(
                    response => {
                        this.confirmationCodeResponse(param, resolve, response);
                    }
                ).catch(error => {
                    resolve(error);
                });
            });
        }
    }

    private confirmationCodeResponse(user: UserParam, resolve, response) {
        this.createConfirmationToken(user).then(
            token => {
                if (AppInstance.config.env === 'development') {
                    console.log("CONFIRM HERE: " + AppInstance.config.appRoot + "/emailconfirmation?email=" + encodeURIComponent(user.email) + "&token=" + encodeURIComponent(token.token));
                }
                AppInstance.mailService.sendConfirmationMail(user.email, AppInstance.config.appRoot + "/emailconfirmation?email=" + encodeURIComponent(user.email) + "&token=" + encodeURIComponent(token.token));
                resolve(response);
            }
        ).catch(
            error => {
                if (AppInstance.config.env === 'development') {
                    resolve(new InternalServerError(error));
                } else {
                    resolve(new InternalServerError());
                }
            }
        )
    }

    @Put("/users/:id")
    put(@Param("id") id: number, @Body() editeduser: User, @Req() request: any) {
        return new Promise((resolve, reject) => {
            let user = request.authenticatedUser;

            if (editeduser.id != user && 0) {
                console.log("ERROR: editeduser.id " + editeduser.id + " != user " + user);
                resolve(new ForbiddenError("Forbidden to change user"));
            } else {
                AppInstance.connection.getRepository(User)
                    .save(editeduser)
                    .then(dbUser => {
                        resolve(new SuccessResponse(dbUser));
                    }).catch(error => {
                    if (AppInstance.config.env === 'development') {
                        resolve(new InternalServerError(error));
                    } else {
                        resolve(new InternalServerError());
                    }
                });
            }
        });
    }

    @Delete("/users/:id")
    remove(@Param("id") id: number) {
        return "Removing user...";
    }

    @Post("/users/login")
    login(@BodyParam("email") email: string, @BodyParam("password") password: string) {
        if (!validator.isEmail(email)) {
            return new BadRequest("invalid email");
        } else if (!validator.isLength(password, UserParam.MIN_PASSWORD_LENGTH)) {
            return new BadRequest("invalid password");
        } else {
            return new Promise((resolve, reject) => {
                AuthorizationHelper.authorize(email, password).then(
                    result => {
                        // returns the token response
                        resolve(result);
                    }
                ).catch(
                    error => {
                        resolve(error);
                    }
                );
            });
        }
    }

    @Get("/users/confirm")
    confirm(@QueryParam("email") email: string, @QueryParam("token") token: string) {
        if (validator.isEmail(email) && !validator.isEmpty(token)) {
            return new Promise((resolve, reject) => {
                AppInstance.entityManager.findOne(ConfirmationToken, {email: email, token: token})
                    .then(
                        token => {
                            if (token.validuntil > new Date()) {
                                AppInstance.entityManager.remove(token).then(ok => {
                                    AppInstance.entityManager.findOne(User, {email: email}).then(
                                        user => {
                                            user.userLevel = UserLevel.USER;
                                            AppInstance.entityManager.save(user).then(success => {
                                                resolve(new SuccessResponse(true));
                                            }).catch(
                                                error => {
                                                    resolve(error)
                                                }
                                            )
                                        }
                                    ).catch(
                                        error => resolve(error)
                                    )
                                }).catch(
                                    error => resolve(error)
                                );
                            } else {
                                resolve(new BadRequest("token outdated"));
                            }
                        }
                    ).catch(error => {
                    resolve(new BadRequest("token invalid"));
                });
            });
        } else {
            return new BadRequest();
        }
    }

    private createConfirmationToken(user: UserParam): Promise<ConfirmationToken> {
        return new Promise((resolve, reject) => {
            AppInstance.entityManager.find(ConfirmationToken, {email: user.email}).then(
                oldTokens => {
                    AppInstance.entityManager.remove(oldTokens).then(
                        info => {
                            let token = new ConfirmationToken();
                            token.token = randtoken.uid(32);
                            token.email = user.email;
                            let validDate = new Date();
                            validDate.setDate(new Date().getDate() + 2);
                            token.validuntil = validDate; // valid 2 days
                            AppInstance.entityManager.save(ConfirmationToken, token).then(
                                tokenResult => {
                                    resolve(tokenResult)
                                }
                            ).catch(
                                error => {
                                    reject(error)
                                }
                            )
                        }
                    ).catch(
                        error => reject(error)
                    );
                }
            ).catch(
                error => reject(error)
            );
        });
    }

    private createUser(params: UserParam): Promise<ApiResponse> {
        return new Promise<ApiResponse>((resolve, reject) => {
            params.toUser().then(user => {
                AppInstance.entityManager.save(User, user).then(
                    user => {
                        resolve(new SuccessResponse({id: user.id}));
                    }
                ).catch((error) => {
                    if (AppInstance.config.env === 'development') {
                        reject(new InternalServerError(error));
                    } else {
                        reject(new InternalServerError());
                    }
                });
            }).catch((error) => {
                if (AppInstance.config.env === 'development') {
                    reject(new InternalServerError(error));
                } else {
                    reject(new InternalServerError());
                }
            });
        });
    }
}
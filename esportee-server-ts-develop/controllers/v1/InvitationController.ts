import {Body, Delete, Get, JsonController, Param, Post, Put, Req, UseBefore} from "routing-controllers";
import {AppInstance} from "../../app";
import {AuthorizationMiddleware} from "./utils/AuthorizationMiddleware";
import {InternalServerError} from "./entities/responses/InternalServerError";
import {SuccessResponse} from "./entities/responses/SuccessResponse";
import {BadRequest} from "./entities/responses/BadRequest";
import {Invitation, InvitationType} from "../../models/Invitation";
import {TournamentConfig} from "../../models/TournamentConfig";
import {User} from "../../models/User";
import {Team} from "../../models/Team";
import {Teammember} from "../../models/Teammember";
import {UserParam} from "./entities/UserParam";
import {ApiResponse} from "./entities/responses/ApiResponse";
import {ApiResponseFilter} from "./utils/ApiResponseFilter";
import {NotFoundError} from "./entities/responses/NotFoundError";
import { TeamController } from "./TeamController";

const randtoken = require('rand-token');

const possibleStates: string[] = ["pending", "confirmed", "declined"];

@JsonController()
export class InvitationController {
    @Get("/invitation/:token")
    get(@Param("token") token: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(Invitation).createQueryBuilder("invitation")
                .leftJoinAndSelect("invitation.tournamentConfig", "tournamentConfig")
                .leftJoinAndSelect("invitation.team", "team")
                .where("invitation.token = :token", {token: token})
                .getOne()
                .then(ApiResponseFilter.filter)
                .then(invitation => resolve(new SuccessResponse(invitation))).catch(
                error => {
                    if (AppInstance.config.env === 'development') {
                        console.log(error);
                        resolve(new InternalServerError(error));
                    } else {
                        resolve(new InternalServerError());
                    }
                }
            )
        });
    }

    @Post("/invitation/")
    @UseBefore(AuthorizationMiddleware)
    post(@Body() body: { userEmail: string, userId: number, teamname: string, teamId: number, tournamentId: number, type: InvitationType }, @Req() request: any) {
        return new Promise((resolve, reject) => {
            let errors: { [s: string]: string } = {};

            if (body.type == undefined) {
                errors = {"wrong_body": "Invitation type is missing!"};
            }

            if (Object.keys(errors).length === 0) {
                switch (body.type) {
                    case InvitationType.ADD_USER_TOURNAMENT:
                        if (body.tournamentId == undefined) {
                            errors = {"wrong_body": "tournamentId is missing!"};
                        }
                        if (body.userEmail == undefined) {
                            errors = {"wrong_body": "userEmail is missing!"};
                        }
                        break;
                    case InvitationType.ADD_TEAM_TOURNAMENT:
                        if (body.tournamentId == undefined) {
                            errors = {"wrong_body": "tournamentId is missing!"};
                        }
                        if (body.teamname == undefined) {
                            errors = {"wrong_body": "teamname is missing!"};
                        }
                        break;
                    case InvitationType.REGISTER_TEAM_TOURNAMENT:
                        if (body.tournamentId == undefined) {
                            errors = {"wrong_body": "tournamentId is missing!"};
                        }
                        if (body.teamId == undefined) {
                            errors = {"wrong_body": "teamId is missing!"};
                        }
                        break;
                    case InvitationType.REGISTER_USER_TOURNAMENT:
                        if (body.tournamentId == undefined) {
                            errors = {"wrong_body": "tournamentId is missing!"};
                        }
                        if (body.userId == undefined) {
                            errors = {"wrong_body": "userId is missing!"};
                        }
                        break;
                    case InvitationType.JOIN_TEAM:
                        if (body.userEmail == undefined && body.userId == undefined) {
                            errors = {"wrong_body": "userEmail or userId is missing!"};
                        }
                        if (body.teamId == undefined) {
                            errors = {"wrong_body": "teamId is missing!"};
                        }
                        break;
                    default:
                        resolve(new InternalServerError("Error: Unknown invitation type"));
                        return;
                }
            }

            if (Object.keys(errors).length === 0) {
                if (body.type == InvitationType.JOIN_TEAM) {
                    let query = AppInstance.connection.getRepository(User).createQueryBuilder("user");
                    if (body.userId != undefined) {
                        query.where("user.id=" + body.userId);
                    } else {
                        query.where("user.email = :email", {email: body.userEmail})
                    }
                    query.getOne()
                        .then(user => {
                            if (user) {
                                AppInstance.connection.getRepository(Team).createQueryBuilder("team")
                                    .leftJoinAndSelect("team.teammembers", "teammembers")
                                    .leftJoinAndSelect("teammembers.user", "user")
                                    .where("team.id=" + body.teamId)
                                    .getOne()
                                    .then(team => {
                                        if (team) {
                                            if (TeamController.isTeamAdmin(team, request.authenticatedUser)) {
                                                if (!TeamController.isActiveMember(team, user.id)) {
                                                    this.createInvitation(user, team, null, InvitationType.JOIN_TEAM).then(
                                                        response => {
                                                            resolve(response);
                                                        }
                                                    )
                                                } else {
                                                    resolve(new InternalServerError("User is already an active teammember!"));
                                                    return;
                                                }
                                            } else {
                                                resolve(new InternalServerError("Permission denied! You are not the team admin."));
                                                return;
                                            }
                                        } else {
                                            resolve(new InternalServerError("Team not found!"));
                                            return;
                                        }
                                    })
                                    .catch(error => {
                                        resolve(error);
                                    });
                            } else {
                                resolve(new InternalServerError("User not found!"));
                            }
                        })
                        .catch(
                            error => {
                                if (AppInstance.config.env === 'development') {
                                    resolve(new InternalServerError(error));
                                } else {
                                    resolve(new InternalServerError());
                                }
                            })
                } else if (body.type == InvitationType.ADD_TEAM_TOURNAMENT || body.type == InvitationType.ADD_USER_TOURNAMENT) {
                    AppInstance.connection.getRepository(TournamentConfig).findOne(body.tournamentId)
                        .then((tournament) => {
                            if (body.type == InvitationType.ADD_USER_TOURNAMENT) {
                                AppInstance.entityManager.findOne(User, {email: body.userEmail})
                                    .then((user) => {
                                        if (user) {
                                            // User already exists
                                            this.createInvitation(user, null, tournament, InvitationType.ADD_USER_TOURNAMENT).then(
                                                response => {
                                                    resolve(response);
                                                }
                                            ).catch(error => {
                                                resolve(error);
                                            });
                                        } else {
                                            // User does not exists, have to be created
                                            let params = new UserParam();
                                            params.username = body.userEmail.replace(/@.*/g, "").replace(/[.]/g, " ");
                                            params.email = body.userEmail;
                                            params.password = randtoken.uid(32);

                                            params.toUser().then(user => {
                                                AppInstance.entityManager.save(User, user).then(
                                                    user => {
                                                        this.createInvitation(user, null, tournament, InvitationType.ADD_USER_TOURNAMENT).then(
                                                            response => {
                                                                resolve(response);
                                                            }
                                                        ).catch(error => {
                                                            resolve(error);
                                                        });
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
                                        }
                                    })
                                    .catch(
                                        error => {
                                            if (AppInstance.config.env === 'development') {
                                                resolve(new InternalServerError(error));
                                            } else {
                                                resolve(new InternalServerError());
                                            }
                                        })
                            } else { // InvitationType.ADD_TEAM_TOURNAMENT
                                AppInstance.entityManager.findOne(Team, {name: body.teamname})
                                    .then(team => {
                                        if (team) {
                                            this.createInvitation(null, team, tournament, InvitationType.ADD_TEAM_TOURNAMENT).then(
                                                response => {
                                                    resolve(response);
                                                }
                                            ).catch(error => {
                                                resolve(error);
                                            });
                                        } else {
                                            resolve(new InternalServerError("Team not found!"));
                                        }
                                    })
                                    .catch(
                                        error => {
                                            if (AppInstance.config.env === 'development') {
                                                resolve(new InternalServerError(error));
                                            } else {
                                                resolve(new InternalServerError());
                                            }
                                        })
                            }
                        })
                        .catch(
                            error => {
                                if (AppInstance.config.env === 'development') {
                                    resolve(new InternalServerError(error));
                                } else {
                                    resolve(new InternalServerError());
                                }
                            })
                } else if (body.type == InvitationType.REGISTER_TEAM_TOURNAMENT || body.type == InvitationType.REGISTER_USER_TOURNAMENT) {
                    AppInstance.connection.getRepository(TournamentConfig).findOne(body.tournamentId)
                        .then((tournament) => {
                            if (body.type == InvitationType.REGISTER_USER_TOURNAMENT) {
                                AppInstance.connection.getRepository(User).findOne(body.userId)
                                    .then((user) => {
                                        if (user) {
                                            // User already exists
                                            this.createInvitation(user, null, tournament, InvitationType.REGISTER_USER_TOURNAMENT).then(
                                                response => {
                                                    resolve(response);
                                                }
                                            ).catch(error => {
                                                resolve(error);
                                            });
                                        } else {
                                            resolve(new InternalServerError("User not exists!"));
                                        }
                                    })
                                    .catch(
                                        error => {
                                            if (AppInstance.config.env === 'development') {
                                                resolve(new InternalServerError(error));
                                            } else {
                                                resolve(new InternalServerError());
                                            }
                                        })
                            } else { // InvitationType.REGISTER_TEAM_TOURNAMENT
                                AppInstance.connection.getRepository(Team).createQueryBuilder("team")
                                    .leftJoinAndSelect("team.teammembers", "teammembers")
                                    .leftJoinAndSelect("teammembers.user", "user")
                                    .where("team.id=" + body.teamId)
                                    .getOne()
                                    .then(team => {
                                        if (team) {
                                            if (TeamController.isTeamAdmin(team, request.authenticatedUser)) {
                                                this.createInvitation(null, team, tournament, InvitationType.REGISTER_TEAM_TOURNAMENT).then(
                                                    response => {
                                                        resolve(response);
                                                    }
                                                ).catch(error => {
                                                    resolve(error);
                                                });
                                            } else {
                                                resolve(new InternalServerError("Permission denied! You are not the team admin."));
                                                return;
                                            }
                                        } else {
                                            resolve(new InternalServerError("Team not found!"));
                                        }
                                    })
                                    .catch(
                                        error => {
                                            if (AppInstance.config.env === 'development') {
                                                resolve(new InternalServerError(error));
                                            } else {
                                                resolve(new InternalServerError());
                                            }
                                        })
                            }
                        })
                        .catch(
                            error => {
                                if (AppInstance.config.env === 'development') {
                                    resolve(new InternalServerError(error));
                                } else {
                                    resolve(new InternalServerError());
                                }
                            })
                } else {
                    resolve(new BadRequest("Create Invitation error, unknown invitation type"));
                }
            } else {
                resolve(new BadRequest("Create Invitation error"));
            }
        })
    }

    @Put("/invitation/")
    @UseBefore(AuthorizationMiddleware)
    put(@Body() body: { token: string, status: string }, @Req() request: any) {
        return new Promise((resolve, reject) => {
            this.updateInvitation(body.token, body.status, request.authenticatedUser).then(
                response => {
                    resolve(response);
                }
            );
        });
    }

    @Get("/invitation/accept/:token")
    @UseBefore(AuthorizationMiddleware)
    acceptInvitation(@Param("token") token: string, @Req() request: any) {
        return new Promise((resolve, reject) => {
            this.updateInvitation(token, "confirmed", request.authenticatedUser).then(
                response => {
                    resolve(response);
                }
            );
        });
    }

    @Get("/invitation/decline/:token")
    @UseBefore(AuthorizationMiddleware)
    declineInvitation(@Param("token") token: string, @Req() request: any) {
        return new Promise((resolve, reject) => {
            this.updateInvitation(token, "declined", request.authenticatedUser).then(
                response => {
                    resolve(response);
                }
            );
        });
    }

    @Delete("/invitation/:token")
    @UseBefore(AuthorizationMiddleware)
    delete(@Param("token") token: string) {
        return new Promise((resolve, reject) => {
            AppInstance.entityManager.delete(Invitation, token)
                .then(() => resolve(new SuccessResponse(true)))
                .catch(
                    error => {
                        if (AppInstance.config.env === 'development') {
                            resolve(new InternalServerError(error));
                        } else {
                            resolve(new InternalServerError());
                        }
                    })
        });
    }

    private createInvitation(user: User|null, team: Team|null, tournamenConfig: TournamentConfig|null, invitationType: InvitationType): Promise<ApiResponse> {
        return new Promise<ApiResponse>((resolve, reject) => {
            let newInvitation = new Invitation();
            newInvitation.token = randtoken.uid(32);
            newInvitation.status = "pending";
            newInvitation.invitationType = invitationType;
            newInvitation.tournamentConfig = tournamenConfig;
            newInvitation.user = user;
            newInvitation.team = team;

            let whereString1 = "";
            let whereString2 = "";
            let query = AppInstance.connection.getRepository(Invitation).createQueryBuilder("invitation");
            switch (invitationType) {
                case InvitationType.ADD_USER_TOURNAMENT:
                case InvitationType.REGISTER_USER_TOURNAMENT:
                    query.innerJoinAndSelect("invitation.user", "user", "user.id=" + newInvitation.user.id);
                    query.innerJoinAndSelect("invitation.tournamentConfig", "config", "config.id=" + newInvitation.tournamentConfig.id);
                    break;
                case InvitationType.ADD_TEAM_TOURNAMENT:
                case InvitationType.REGISTER_TEAM_TOURNAMENT:
                    query.innerJoinAndSelect("invitation.team", "team", "team.id=" + newInvitation.team.id);
                    query.innerJoinAndSelect("invitation.tournamentConfig", "config", "config.id=" + newInvitation.tournamentConfig.id);
                    break;
                case InvitationType.JOIN_TEAM:
                    query.innerJoinAndSelect("invitation.user", "user", "user.id=" + newInvitation.user.id);
                    query.innerJoinAndSelect("invitation.team", "team", "team.id=" + newInvitation.team.id);
                    break;
                default:
                    resolve(new InternalServerError("Error: Unknown invitation type"));
                    return;
            }        
            
            query.getOne()
                .then(invitation => {
                    if (invitation) {
                        resolve(new InternalServerError("Invitation already exists"));
                    } else {
                        AppInstance.entityManager.save(Invitation, newInvitation)
                            .then(ApiResponseFilter.filter)
                            .then(savedInvitation => {
                                let acceptInviteLink = AppInstance.config.appRoot + "/accept-invite/" + newInvitation.token;
                                let declineInviteLink = AppInstance.config.appRoot + "/decline-invite/" + newInvitation.token;
                                if (invitationType == InvitationType.ADD_USER_TOURNAMENT) {
                                    AppInstance.mailService.sendCreateInvitationMail(user.email, null, tournamenConfig, acceptInviteLink, declineInviteLink);
                                    resolve(new SuccessResponse(savedInvitation));
                                } else if (invitationType == InvitationType.ADD_TEAM_TOURNAMENT) {
                                    AppInstance.connection
                                        .getRepository(Team)
                                        .createQueryBuilder("team")
                                        .leftJoinAndSelect("team.teammembers", "teammembers")
                                        .leftJoinAndSelect("teammembers.user", "user")
                                        .where("team.id=" + team.id)
                                        .getOne()
                                        .then(teamWithMembers => {
                                            let admin = TeamController.getAdmin(teamWithMembers);
                                            AppInstance.mailService.sendCreateInvitationMail(admin.user.email, team.name, tournamenConfig, acceptInviteLink, declineInviteLink);
                                            resolve(new SuccessResponse(savedInvitation));
                                        })
                                        .catch(error => {
                                            if (AppInstance.config.env === 'development') {
                                                resolve(new InternalServerError(error));
                                            } else {
                                                resolve(new InternalServerError());
                                            }
                                        })
                                } else if (invitationType == InvitationType.JOIN_TEAM) {
                                    AppInstance.mailService.sendCreateInvitationMail(user.email, team.name, null, acceptInviteLink, declineInviteLink);
                                    resolve(new SuccessResponse(savedInvitation));
                                } else if (invitationType == InvitationType.REGISTER_USER_TOURNAMENT) {
                                    AppInstance.mailService.sendSuccessRegisterForTournamentMail(user.email, null, tournamenConfig, declineInviteLink);
                                    resolve(new SuccessResponse(true));
                                } else if (invitationType == InvitationType.REGISTER_TEAM_TOURNAMENT) {
                                    AppInstance.connection
                                        .getRepository(Team)
                                        .createQueryBuilder("team")
                                        .leftJoinAndSelect("team.teammembers", "teammembers")
                                        .leftJoinAndSelect("teammembers.user", "user")
                                        .where("team.id=" + team.id)
                                        .getOne()
                                        .then(teamWithMembers => {
                                            let admin = TeamController.getAdmin(teamWithMembers);
                                            AppInstance.mailService.sendSuccessRegisterForTournamentMail(admin.user.email, team.name, tournamenConfig, declineInviteLink);
                                            resolve(new SuccessResponse(true));
                                        })
                                        .catch(error => {
                                            if (AppInstance.config.env === 'development') {
                                                resolve(new InternalServerError(error));
                                            } else {
                                                resolve(new InternalServerError());
                                            }
                                        })
                                } else {
                                    resolve(new InternalServerError("Error: Unknown invitation type"));
                                }
                            })
                            .catch(
                                error => {
                                    if (AppInstance.config.env === 'development') {
                                        resolve(new InternalServerError(error));
                                    } else {
                                        resolve(new InternalServerError());
                                    }
                                })
                    }
                })
                .catch(
                    error => {
                        if (AppInstance.config.env === 'development') {
                            resolve(new InternalServerError(error));
                        } else {
                            resolve(new InternalServerError());
                        }
                    })
        });
    }

    private updateInvitation(token: string, status: string, authenticatedUser: any){
        return new Promise<ApiResponse>((resolve, reject) => {
            if (possibleStates.indexOf(status) < 0) {
                resolve(new InternalServerError("Invitation status is wrong"));
            }

            AppInstance.connection.getRepository(Invitation).createQueryBuilder("invitation")
            .leftJoinAndSelect("invitation.tournamentConfig", "tournamentConfig")
            .leftJoinAndSelect("invitation.user", "user")
            .leftJoinAndSelect("invitation.team", "team")
            .where("invitation.token = :token", {token: token})
            .getOne()
            .then(invitation => {
                if (invitation) {
                    invitation.status = status;

                    if (invitation.status == "confirmed" && invitation.invitationType == InvitationType.JOIN_TEAM) {
                        AppInstance.connection.getRepository(Team).createQueryBuilder("team")
                            .leftJoinAndSelect("team.teammembers", "teammembers")
                            .leftJoinAndSelect("teammembers.user", "user")
                            .where("team.id=" + invitation.team.id)
                            .getOne()
                            .then(team => {
                                AppInstance.entityManager.delete(Invitation, invitation.token)
                                .then(() => {
                                    if (TeamController.isActiveMember(team, invitation.user.id)) {
                                        resolve(new InternalServerError("User is already an active teammember!"));
                                    } else {
                                        let newTeammember: Teammember;
                                        if (TeamController.isFormerMember(team, invitation.user.id)) {
                                            newTeammember = TeamController.getTeammemberByUserid(team, invitation.user.id);
                                        } else {
                                            newTeammember = new Teammember();
                                            newTeammember.joinDate = [];
                                            newTeammember.quitDate = [];
                                            newTeammember.user = invitation.user;
                                        }
                                        newTeammember.joinDate.push(new Date());
                                        AppInstance.entityManager.save(Teammember, newTeammember)
                                            .then(teammember => {
                                                resolve(new SuccessResponse(true));
                                                if (!TeamController.isMember(team, invitation.user.id)) {
                                                    team.teammembers.push(teammember);
                                                }
                                                AppInstance.entityManager.save(Team, team)
                                                    .then(savedTeam => {
                                                        AppInstance.mailService.sendSuccessJoinedTeamMail(invitation.user.email, team.name);
                                                        resolve(new SuccessResponse(true));
                                                    })
                                                    .catch(error => {
                                                        AppInstance.entityManager.remove(Teammember, teammember)
                                                            .then(() => {
                                                                if (AppInstance.config.env === 'development') {
                                                                    resolve(new InternalServerError(error));
                                                                } else {
                                                                    resolve(new InternalServerError());
                                                                }
                                                            })

                                                    })
                                            })
                                            .catch(error => {
                                                if (AppInstance.config.env === 'development') {
                                                    resolve(new InternalServerError(error));
                                                } else {
                                                    resolve(new InternalServerError());
                                                }
                                            })
                                    }
                                })
                            })
                    } else {
                        // check if user is tournament admin
                        if (invitation.status == "confirmed" && (invitation.invitationType == InvitationType.REGISTER_TEAM_TOURNAMENT ||
                            invitation.invitationType == InvitationType.REGISTER_USER_TOURNAMENT)) {
                            if (invitation.tournamentConfig.userId != authenticatedUser) {
                                resolve(new InternalServerError("Forbidden!"));
                                return;
                            }
                        }

                        AppInstance.entityManager.save(Invitation, invitation)
                        .then(savedInvitation => resolve(new SuccessResponse(true)))
                        .catch(
                            error => {
                                if (AppInstance.config.env === 'development') {
                                    resolve(new InternalServerError(error));
                                } else {
                                    resolve(new InternalServerError());
                                }
                            }
                        )
                    }                        
                } else {
                    resolve(new InternalServerError("Invitation does not exists"));
                }
            })
            .catch(error => {
                if (AppInstance.config.env === 'development') {
                    resolve(new InternalServerError(error));
                } else {
                    resolve(new InternalServerError());
                }
            })
        });
    }
}
import {Get, Delete, Put, JsonController, UseBefore, Req, Post, Body, Param} from "routing-controllers";
import {AppInstance} from "../../app";
import {AuthorizationMiddleware} from "./utils/AuthorizationMiddleware";
import {InternalServerError} from "./entities/responses/InternalServerError";
import {SuccessResponse} from "./entities/responses/SuccessResponse";
import { BadRequest } from "./entities/responses/BadRequest";
import {Team} from "../../models/Team";
import {User} from "../../models/User";
import {Invitation, InvitationType} from "../../models/Invitation";
import {ApiResponseFilter} from "./utils/ApiResponseFilter";
import {ApiResponse} from "./entities/responses/ApiResponse";
import {Teammember} from "../../models/Teammember";

@JsonController()
export class TeamController {
    @Get("/teams/")
    @UseBefore(AuthorizationMiddleware)
    get() {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(Team).createQueryBuilder("token")
                .getMany()
                .then(ApiResponseFilter.filter)
                .then(teams => resolve(new SuccessResponse(teams))).catch(
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

    @Get("/team/:id")
    @UseBefore(AuthorizationMiddleware)
    getTeamById(@Param("id") id: number) {
        return new Promise((resolve, reject) => {
          AppInstance.connection.getRepository(Team).createQueryBuilder("team")
            .leftJoinAndSelect("team.teammembers", "teammembers")
            .leftJoinAndSelect("teammembers.user", "user")
            .where("team.id=" + id)
            .getOne()
            .then(ApiResponseFilter.filter)
            .then(team => resolve(new SuccessResponse(team))).catch(
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

    @Get("/team/:id/invitations")
    @UseBefore(AuthorizationMiddleware)
    getInvitations(@Param("id") id: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(Invitation).createQueryBuilder("invitation")
                .leftJoin("invitation.team", "team")
                .leftJoinAndSelect("invitation.user", "user")
                .where("team.id=" + id)
                .andWhere("invitation.invitationType=" + InvitationType.JOIN_TEAM)
                .getMany()
                .then(ApiResponseFilter.filter)
                .then(invitations => resolve(new SuccessResponse(invitations)))
                .catch(
                error => {
                    if (AppInstance.config.env === 'development') {
                        resolve(new InternalServerError(error));
                    } else {
                        resolve(new InternalServerError());
                    }
                });
        });
    }

    @Get("/teams/user/")
    @UseBefore(AuthorizationMiddleware)
    getAllTeamsFromUser(@Req() request: any) {
        return new Promise((resolve, reject) => {
          AppInstance.connection.getRepository(Team).createQueryBuilder("team")
                .leftJoinAndSelect("team.teammembers", "teammembers")
                .leftJoinAndSelect("teammembers.user", "user")
                .where("user.id=" + request.authenticatedUser)
                .getMany()
                .then(ApiResponseFilter.filter)
                .then(teams => {
                    let activeTeams: Team[] = [];
                    for (let team of teams) {
                        if (TeamController.isActiveMember(team, request.authenticatedUser)) {
                            activeTeams.push(team);
                        }
                    }
                  resolve(new SuccessResponse(activeTeams))
                }).catch(
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

    @Get("/teams/by/user/:id")
    @UseBefore(AuthorizationMiddleware)
    getTeamsByUserId(@Param("id") id: number) {
        return new Promise((resolve, reject) => {
          AppInstance.connection.getRepository(Team).createQueryBuilder("team")
                .leftJoinAndSelect("team.teammembers", "teammembers")
                .leftJoinAndSelect("teammembers.user", "user")
                .where("user.id=" + id)
                .getMany()
                .then(ApiResponseFilter.filter)
                .then(teams => {
                    let activeTeams: Team[] = [];
                    for (let team of teams) {
                        if (TeamController.isActiveMember(team, id)) {
                            activeTeams.push(team);
                        }
                    }
                  resolve(new SuccessResponse(activeTeams))
                }).catch(
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

    @Post("/team/")
    @UseBefore(AuthorizationMiddleware)
    post( @Body() body: { name: string }, @Req() request: any) {
      return new Promise((resolve, reject) => {
        let errors: { [s: string]: string } = {};
  
        if (body.name == undefined) {
          errors = { "name": "Name is missing!" };
        } else {
            let isWhitespace = (body.name || '').trim().length === 0;
            if (isWhitespace) {
                errors = { "name": "Not a valid team name!" };
            } else {
                // remove leading whitespace
                body.name = body.name.trim();
            }
        }
  
        if (Object.keys(errors).length === 0) {
          AppInstance.entityManager.findOne(Team, {name: body.name})
            .then((team) => {
                  if (team) {
                    // Team already exists
                    resolve(new InternalServerError("Team already exists!"));
                  } else {
                    AppInstance.entityManager.findOne(User, request.authenticatedUser)
                    .then(user => {
                        let newTeammember = new Teammember();
                        newTeammember.joinDate = [];
                        newTeammember.quitDate = [];
        
                        newTeammember.joinDate.push(new Date());
                        newTeammember.user = user;
                        AppInstance.entityManager.save(Teammember, newTeammember)
                            .then(teammember => {
                                // Team does not exists, have to be created
                                let newTeam = new Team();
                                newTeam.name = body.name;
                                newTeam.teammembers = [];

                                newTeam.teammembers.push(teammember);
                                AppInstance.entityManager.save(Team, newTeam)
                                    .then(ApiResponseFilter.filter)
                                    .then(savedTeam => {
                                        resolve(new SuccessResponse(savedTeam));
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
                    })
                    .catch(error => {
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
        } else {
          resolve(new BadRequest("Create team error"));
        }
      })
    }

    @Put("/team/")
    @UseBefore(AuthorizationMiddleware)
    put(@Body() body: {id: number, name: string}, @Req() request: any) {
        return new Promise((resolve, reject) => {
            let errors: { [s: string]: string } = {};

            if (body.id == undefined) {
                errors = {"wrong_body": "Team id is missing!"};
            }
            if (body.name == undefined) {
                errors = {"wrong_body": "Team name is missing!"};
            } else {
                let isWhitespace = (body.name || '').trim().length === 0;
                if (isWhitespace) {
                    errors = { "name": "Not a valid team name!" };
                } else {
                    // remove leading whitespace
                    body.name = body.name.trim();
                }
            }

            if (Object.keys(errors).length === 0) {
                AppInstance.connection.getRepository(Team).createQueryBuilder("team")
                    .leftJoinAndSelect("team.teammembers", "teammembers")
                    .leftJoinAndSelect("teammembers.user", "user")
                    .where("team.id=" + body.id)
                    .getOne()
                    .then(team => {
                        if (TeamController.isTeamAdmin(team, request.authenticatedUser)) {
                            team.name = body.name;
                            AppInstance.connection.getRepository(Team).save(team)
                            .then(() => resolve(new SuccessResponse(true)))
                            .catch(
                                error => {
                                    if (AppInstance.config.env === 'development') {
                                        resolve(new InternalServerError(error));
                                    } else {
                                        resolve(new InternalServerError());
                                    }
                                })
                        } else {
                            resolve(new InternalServerError("Permission denied! You are not the team admin."));
                        }
                    }).catch(
                        error => {
                            if (AppInstance.config.env === 'development') {
                                resolve(new InternalServerError(error));
                            } else {
                                resolve(new InternalServerError());
                            }
                        })
            } else {
                resolve(new BadRequest("Update team error"));
            }
        });
    }

    @Delete("/teammember/:teammemberId")
    @UseBefore(AuthorizationMiddleware)
    quitTeammember(@Param("teammemberId") teammemberId: number, @Req() request: any) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(Teammember).createQueryBuilder("teammember")
                .leftJoinAndSelect("teammember.team", "team")
                .leftJoinAndSelect("team.teammembers", "allTeammembers")
                .leftJoinAndSelect("allTeammembers.user", "user")
                .where("teammember.id=" + teammemberId)
                .getOne()
                .then(teammember => {
                    if (!TeamController.isActiveTeammember(teammember)) {
                        resolve(new InternalServerError("This team member already left the team."));
                    } else {
                        if (TeamController.isTeamAdmin(teammember.team, request.authenticatedUser) ||
                            TeamController.isThisTeammember(teammember.team, request.authenticatedUser, teammemberId)) {
                            if (TeamController.getActiveMembers(teammember.team).length < 2) {
                                resolve(new InternalServerError("You can't quit as you are the last active temmember! Please delete the group instead!"));
                            } else {
                                teammember.quitDate.push(new Date());
                                AppInstance.connection.getRepository(Teammember).save(teammember)
                                .then(() => resolve(new SuccessResponse(true)))
                                .catch(
                                    error => {
                                        if (AppInstance.config.env === 'development') {
                                            resolve(new InternalServerError(error));
                                        } else {
                                            resolve(new InternalServerError());
                                        }
                                    })
                            }                        
                        } else {
                            resolve(new InternalServerError("Permission denied! You are not the team admin."));
                        }
                    }
                })           
        });
    }

    static isThisTeammember(team: Team, userId: number, teammemberId: number): boolean {
        let teammember = team.teammembers.find(teammember => 
            teammember.user.id == userId && teammember.id == teammemberId);
        return teammember ? true : false;
    }

    static isTeamAdmin(team: Team, userId: number): boolean {
        let admin = TeamController.getAdmin(team);

        if (admin != null && admin.user.id == userId) {
            return true;
        } else {
            return false;
        }
    }

    static isActiveTeammember(teammember: Teammember): boolean {
        let lastJoinDate = TeamController.sortDatesDesc(teammember.joinDate)[0];
        let lastQuitDate = TeamController.sortDatesDesc(teammember.quitDate)[0];

        if (lastQuitDate) {
            if (lastQuitDate > lastJoinDate) {
                return false;
            }
        }
        return true;
    }

    static isActiveMember(team: Team, userId: number): boolean {
        let teammember = team.teammembers.find(teammember => 
            teammember.user.id == userId && TeamController.isActiveTeammember(teammember));
        return teammember ? true : false;
    }

    static isFormerMember(team: Team, userId: number): boolean {
        let teammember = team.teammembers.find(teammember => 
            teammember.user.id == userId && !TeamController.isActiveTeammember(teammember));
        return teammember ? true : false;
    }

    static isMember(team: Team, userId: number): boolean {
        let teammember = team.teammembers.find(teammember => teammember.user.id == userId);
        return teammember ? true : false;
    }

    static getAdmin(team: Team): Teammember {
        let activeMembers = TeamController.getActiveMembers(team);
        if (activeMembers.length < 1) {
            console.log("Error: No active teammember in team!");
            return null;
        }

        let admin: Teammember = activeMembers[0];
        let adminLastJoinDate = TeamController.sortDatesDesc(admin.joinDate)[0];
        for (let teammember of activeMembers) {
            let thisLastJoinDate = TeamController.sortDatesDesc(teammember.joinDate)[0];
            if (thisLastJoinDate < adminLastJoinDate) {
                adminLastJoinDate = thisLastJoinDate;
                admin = teammember;
            }
        }
        return admin;
    }

    static getTeammemberByUserid(team: Team, userId: number): Teammember {
        let teammember = team.teammembers.find(teammember => teammember.user.id == userId);
        return teammember;
    }

    static getActiveMembers(team: Team): Teammember[] {
        let teammember = team.teammembers.filter(teammember => TeamController.isActiveTeammember(teammember));
        return teammember;
    }

    static sortDatesDesc(array: Date[]) {
        let date_sort_desc = function (date1, date2) {
            if (date1 > date2) return -1;
            if (date1 < date2) return 1;
            return 0;
        };
        return array.sort(date_sort_desc);
    }
}
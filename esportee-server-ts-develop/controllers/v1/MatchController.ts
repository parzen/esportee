import {Body, Get, JsonController, Param, Post, Req, UseBefore} from "routing-controllers";
import {AppInstance} from "../../app";
import {AuthorizationMiddleware} from "./utils/AuthorizationMiddleware";
import {InternalServerError} from "./entities/responses/InternalServerError";
import {SuccessResponse} from "./entities/responses/SuccessResponse";
import {BadRequest} from "./entities/responses/BadRequest";
import {ForbiddenError} from "./entities/responses/ForbiddenError";
import {Match} from "../../models/Match";
import {MatchToken} from "../../models/MatchToken";
import {User} from "../../models/User";
import {Team} from "../../models/Team";
import {ApiResponseFilter} from "./utils/ApiResponseFilter";
import {TournamentConfig} from "../../models/TournamentConfig";
import {IMatchToken, MatchFactory, MatchState, TcUtils} from "tournament-creator-ts";
import {TournamentController} from "./TournamentController";
import {TeamController} from "./TeamController";
import {WebSocketHelper} from "../../utils/WebSocketHelper";

@JsonController()
export class MatchController {
    @Get("/match/:id")
    @UseBefore(AuthorizationMiddleware)
    get(@Param("id") id: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(Match).createQueryBuilder("match")
                .leftJoinAndSelect("match.opponents", "opps")
                .leftJoinAndSelect("opps.user", "user")
                .leftJoinAndSelect("opps.team", "team")
                .leftJoinAndSelect("match.stage", "stage")
                .leftJoinAndSelect("stage.config", "tournament")
                .where("match.id=" + id)
                .getOne().then(ApiResponseFilter.filter)
                .then(match => {
                    resolve(new SuccessResponse(match))
                })
                .catch(error => {
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

    @Post("/match/result")
    @UseBefore(AuthorizationMiddleware)
    postResult(@Body() match: Match, @Req() request: any) {
        return new Promise((resolve, reject) => {
            let errors = match.validate();
            let user = request.authenticatedUser;
            if (Object.keys(errors).length === 0) {
                AppInstance.connection.getRepository(Match)
                    .createQueryBuilder("match")
                    .leftJoinAndSelect("match.opponents", "opponents")
                    .leftJoinAndSelect("opponents.user", "user")
                    .leftJoinAndSelect("opponents.team", "team")
                    .leftJoinAndSelect("team.teammembers", "teammembers")
                    .leftJoinAndSelect("teammembers.user", "teamUser")
                    .leftJoinAndSelect("match.stage", "stage")
                    .leftJoinAndSelect("stage.config", "tournamentconfig")
                    .where("match.id=" + match.id)
                    .getOne()
                    .then(dbMatch => {
                        // match opponent
                        let authenticatedOpponent = MatchController.isAuthenticatedOpponent(dbMatch, user);

                        // Tournament admin
                        let authenticatedAdmin = false;
                        if (!authenticatedOpponent) {
                            authenticatedAdmin = MatchController.isAuthenticatedAdmin(dbMatch, user);
                        }

                        if (authenticatedOpponent || authenticatedAdmin) {
                            if (dbMatch.status === MatchState.PENDING || dbMatch.status === MatchState.DISPUTED) {
                                dbMatch.status = MatchState.WAITING_FOR_REPLY;

                                for (let opponent of match.opponents) {
                                    for (let opponentDb of dbMatch.opponents) {
                                        if (opponent.id == opponentDb.id) {
                                            opponentDb.score = opponent.score;
                                            break;
                                        }
                                    }
                                }

                                if (authenticatedOpponent) {
                                    let unapprovedOpponents = dbMatch.opponents.filter(opponent => {
                                        if (opponent.user && opponent.user.id === user) {
                                            opponent.resultApprovedTimestamp = new Date();
                                        }
                                        if (opponent.team && opponent.team.teammembers) {
                                            for (let teammember of opponent.team.teammembers) {
                                                if (teammember.user.id === user) {
                                                    opponent.resultApprovedTimestamp = new Date();
                                                }
                                            }
                                        }
                                        return opponent.resultApprovedTimestamp == null;
                                    });
                                    if (dbMatch.opponents.length - unapprovedOpponents.length === 1) {
                                        unapprovedOpponents.map(opponent => {
                                            if (opponent.team && opponent.team.teammembers) {
                                                let admin = TeamController.getAdmin(opponent.team);
                                                if (admin != null) {
                                                    AppInstance.webSocketHelper.sendMessageToUser("" + admin.user.id, {
                                                        type: WebSocketHelper.KEY_NOTIFICATION_UNAPPROVED_MATCH,
                                                        data: ApiResponseFilter.filter(dbMatch)
                                                    });
                                                }
                                            } else {
                                                AppInstance.webSocketHelper.sendMessageToUser("" + opponent.user.id, {
                                                    type: WebSocketHelper.KEY_NOTIFICATION_UNAPPROVED_MATCH,
                                                    data: ApiResponseFilter.filter(dbMatch)
                                                })
                                            }
                                        });
                                    }
                                }
                                AppInstance.connection.getRepository(Match)
                                    .save(dbMatch)
                                    .then(ApiResponseFilter.filter)
                                    .then((savedMatch) => {
                                        resolve(new SuccessResponse(savedMatch));
                                    }).catch(error => {
                                    if (AppInstance.config.env === 'development') {
                                        resolve(new InternalServerError(error));
                                    } else {
                                        resolve(new InternalServerError());
                                    }
                                }).catch(
                                    error => {
                                        if (AppInstance.config.env === 'development') {
                                            resolve(new InternalServerError(error));
                                        } else {
                                            resolve(new InternalServerError());
                                        }
                                    }
                                );

                            } else {
                                resolve(new ForbiddenError("result already submitted"));
                            }
                        } else {
                            resolve(new ForbiddenError("user is not authenticated to change match result"));
                        }
                    });
            } else {
                resolve(new BadRequest("config invalid"));
            }
        });
    }

    @Post("/match/approveresult")
    @UseBefore(AuthorizationMiddleware)
    postApproveResult(@Body() body: { id: string }, @Req() request: any) {
        return new Promise((resolve, reject) => {
            let user = request.authenticatedUser;
            AppInstance.connection.getRepository(Match)
                .createQueryBuilder("match")
                .leftJoinAndSelect("match.opponents", "opponents")
                .leftJoinAndSelect("opponents.user", "user")
                .leftJoinAndSelect("opponents.team", "team")
                .leftJoinAndSelect("team.teammembers", "teammembers")
                .leftJoinAndSelect("teammembers.user", "teamUser")
                .leftJoinAndSelect("match.stage", "stage")
                .leftJoinAndSelect("stage.config", "tournamentconfig")
                .where("match.id=" + body.id)
                .getOne()
                .then(dbMatch => {
                    // match opponent
                    let authenticatedOpponent = MatchController.isAuthenticatedOpponent(dbMatch, user);

                    // Tournament admin
                    let authenticatedAdmin = MatchController.isAuthenticatedAdmin(dbMatch, user);

                    if (authenticatedOpponent || authenticatedAdmin) {
                        if (dbMatch.status === MatchState.WAITING_FOR_REPLY) {
                            let approved = false;
                            let approvalCount = 0;
                            dbMatch.opponents.map(opponent => {
                                if (opponent.user && opponent.user.id === user || authenticatedAdmin) {
                                    opponent.resultApprovedTimestamp = new Date();
                                }
                                if (opponent.team && opponent.team.teammembers) {
                                    for (let teammember of opponent.team.teammembers) {
                                        if (teammember.user.id === user) {
                                            opponent.resultApprovedTimestamp = new Date();
                                        }
                                    }
                                }
                                if (opponent.resultApprovedTimestamp != null) {
                                    approvalCount++;
                                }
                                approved = true;
                            });

                            if (approvalCount === dbMatch.opponents.length) {
                                dbMatch.status = MatchState.FINISHED;
                            }

                            AppInstance.connection.getRepository(Match)
                                .save(dbMatch)
                                .then(ApiResponseFilter.filter)
                                .then((savedMatch) => {
                                    if (approved) {
                                        MatchController.updateNextStage(savedMatch);
                                        resolve(new SuccessResponse(dbMatch));
                                    } else {
                                        resolve(new ForbiddenError("not allowed to approve"));
                                    }
                                }).catch(error => {
                                if (AppInstance.config.env === 'development') {
                                    resolve(new InternalServerError(error));
                                } else {
                                    resolve(new InternalServerError());
                                }
                            });
                        } else {
                            resolve(new ForbiddenError("no result or already finished"));
                        }
                    } else {
                        resolve(new ForbiddenError("user is not authenticated to approve match result"));
                    }
                }).catch(error => {
                if (AppInstance.config.env === 'development') {
                    resolve(new InternalServerError(error));
                } else {
                    resolve(new InternalServerError());
                }
            });
        });
    }

    @Post("/match/disputeresult")
    @UseBefore(AuthorizationMiddleware)
    postDisputeResult(@Body() body: { id: string }, @Req() request: any) {
        return new Promise((resolve, reject) => {
            let user = request.authenticatedUser;
            AppInstance.connection.getRepository(Match)
                .createQueryBuilder("match")
                .leftJoinAndSelect("match.opponents", "opponents")
                .leftJoinAndSelect("opponents.user", "user")
                .leftJoinAndSelect("opponents.team", "team")
                .leftJoinAndSelect("team.teammembers", "teammembers")
                .leftJoinAndSelect("teammembers.user", "teamUser")
                .leftJoinAndSelect("match.stage", "stage")
                .leftJoinAndSelect("stage.config", "tournamentconfig")
                .where("match.id=" + body.id)
                .getOne()
                .then(dbMatch => {
                    // match opponent
                    let authenticatedOpponent = MatchController.isAuthenticatedOpponent(dbMatch, user);

                    // Tournament admin
                    let authenticatedAdmin = MatchController.isAuthenticatedAdmin(dbMatch, user);

                    if (authenticatedOpponent || authenticatedAdmin) {
                        if (dbMatch.status === MatchState.WAITING_FOR_REPLY) {
                            dbMatch.opponents.map(opponent => {
                                opponent.resultApprovedTimestamp = null;
                                opponent.score = 0;
                            });

                            dbMatch.status = MatchState.DISPUTED;

                            AppInstance.connection.getRepository(Match)
                                .save(dbMatch)
                                .then(ApiResponseFilter.filter)
                                .then((savedMatch) => {
                                    resolve(new SuccessResponse(dbMatch));
                                }).catch(error => {
                                if (AppInstance.config.env === 'development') {
                                    resolve(new InternalServerError(error));
                                } else {
                                    resolve(new InternalServerError());
                                }
                            });
                        } else {
                            resolve(new ForbiddenError("no result or already finished"));
                        }
                    } else {
                        resolve(new ForbiddenError("user is not authenticated to dispute match result"));
                    }
                }).catch(error => {
                if (AppInstance.config.env === 'development') {
                    resolve(new InternalServerError(error));
                } else {
                    resolve(new InternalServerError());
                }
            });
        });
    }

    @Get("/matches/user/:id")
    @UseBefore(AuthorizationMiddleware)
    getMatchesFromUser(@Param("id") id: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(Match).createQueryBuilder("match")
                .leftJoinAndSelect("match.opponents", "opponents")
                .leftJoinAndSelect("opponents.user", "user")
                .where("user.id=" + id)
                .andWhere("match.status != :status", {status: MatchState.WILDCARD})
                .getMany()
                .then(matches => {
                    let matchesIds: number[] = [];
                    matches.forEach(match => {
                        matchesIds.push(match.id);
                    })

                    AppInstance.connection.getRepository(Match).createQueryBuilder("matches")
                        .leftJoinAndSelect("matches.opponents", "opponents")
                        .leftJoinAndSelect("opponents.user", "user")
                        .whereInIds(matchesIds)
                        .getMany()
                        .then(ApiResponseFilter.filter)
                        .then(matchesWithOpponents => {
                            resolve(new SuccessResponse(matchesWithOpponents))
                        })
                        .catch(error => {
                            if (AppInstance.config.env === 'development') {
                                console.log(error);
                                resolve(new InternalServerError(error));
                            } else {
                                resolve(new InternalServerError());
                            }
                        })
                }).catch(
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

    public static isAuthenticatedOpponent(dbMatch: Match, authenticatedUser): boolean {
        for (let opponent of dbMatch.opponents) {
            if (opponent.user && opponent.user.id === authenticatedUser) {
                return true;
            }
            if (opponent.team && opponent.team.teammembers) {
                for (let teammember of opponent.team.teammembers) {
                    if (teammember.user.id === authenticatedUser) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public static isAuthenticatedAdmin(dbMatch: Match, authenticatedUser): boolean {
        if (dbMatch.stage.config.userId === authenticatedUser) {
            return true;
        }
        return false;
    }

    // update one complete stage
    public static updateFullTournament(tournamentId: number, stageOrder: number, phase: number) {
        // console.log("###########   Try to updateFullTournament with: "+stageOrder+" phase: "+phase+ "   ###########");

        // Search for all matches in current stageOrder and phase and set status to wildcard if one opponent is empty
        AppInstance.connection.getRepository(Match).createQueryBuilder("match")
            .leftJoinAndSelect("match.opponents", "opponents")
            .leftJoinAndSelect("match.stage", "stage")
            .leftJoinAndSelect("stage.config", "tournament")
            .where("tournament.id=" + tournamentId)
            .andWhere("phase=" + phase)
            .andWhere("stage.order=" + stageOrder)
            .andWhere("match.status = :status", {status: MatchState.PENDING})
            .getMany().then(matches => {
            let matchesToChange: Match[] = [];
            matches.forEach(match => {
                for (let opponent of match.opponents) {
                    if (opponent.token == MatchFactory.EMPTY_ENTRY.token) {
                        match.status = MatchState.WILDCARD;
                        matchesToChange.push(match);
                        break;
                    }
                }
            });

            AppInstance.connection.getRepository(Match)
                .save(matchesToChange).then((savedMatches) => {
                // get new tournament of current stageOrder and phase and call updateNextStage
                AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournament")
                    .leftJoinAndSelect("tournament.stageConfigs", "stageConfigs")
                    .leftJoinAndSelect("stageConfigs.matches", "matches")
                    .leftJoinAndSelect("matches.opponents", "opponents")
                    .leftJoinAndSelect("opponents.user", "opponentuser")
                    .leftJoinAndSelect("opponents.team", "opponentteam")
                    .where("tournament.id=" + tournamentId)
                    .getOne().then(tournament => {
                    let nextStage = tournament.stageConfigs.filter(stage => stage.order == stageOrder)[0];
                    if (!nextStage) {
                        // console.log("Reached end of tournament with stage: "+stageOrder);
                        TournamentController.checkTournamentFinished(tournament.id);
                        return;
                    }

                    let maxPhase = Math.max.apply(Math, nextStage.matches.map(match => match.phase));
                    let matches = nextStage.matches.filter(match => match.phase == phase);
                    let iMatchTokens: IMatchToken[] = [];
                    for (let match of matches) {
                        iMatchTokens = iMatchTokens.concat(TcUtils.updateNextStage(tournament, match.bracket, match.phase, stageOrder));
                    }

                    let promises: Array<Promise<IMatchToken>> = [];
                    iMatchTokens.forEach(iMatchToken => {
                        promises.push(new Promise<IMatchToken>((resolve, reject) => {
                            if (!iMatchToken.user && !iMatchToken.team) {
                                iMatchToken.token = MatchFactory.EMPTY_ENTRY.token;
                                resolve(iMatchToken);
                            } else {
                                if (tournament.isATeamTournament) {
                                    AppInstance.entityManager.findOne(Team, iMatchToken.team.id)
                                        .then(team => {
                                            iMatchToken.team = team;
                                            resolve(iMatchToken)
                                        })
                                        .catch((error) => {
                                            reject(new InternalServerError())
                                        });
                                } else {
                                    AppInstance.entityManager.findOne(User, iMatchToken.user.id)
                                        .then(user => {
                                            iMatchToken.user = user;
                                            resolve(iMatchToken)
                                        })
                                        .catch((error) => {
                                            reject(new InternalServerError())
                                        });
                                }
                            }
                        }));
                    })

                    Promise.all(promises).then(tokens => {
                        AppInstance.entityManager.save(MatchToken, tokens)
                            .then(savedToken => {
                                if (phase == maxPhase) {
                                    MatchController.updateFullTournament(tournamentId, ++stageOrder, 0);
                                } else {
                                    MatchController.updateFullTournament(tournamentId, stageOrder, ++phase);
                                }
                            })
                            .catch(
                                error => {
                                    if (AppInstance.config.env === 'development') {
                                        console.log(error);
                                    }
                                })
                    }).catch(error => {
                        console.log(error);
                    });
                })
                    .catch(
                        error => {
                            if (AppInstance.config.env === 'development') {
                                console.log(error);
                            }
                        });
            }).catch(error => {
                console.log(error);
            });
        })
            .catch(
                error => {
                    if (AppInstance.config.env === 'development') {
                        console.log(error);
                    }
                });
    }

    // for one updated match
    public static updateNextStage(savedMatch: Match) {
        AppInstance.connection.getRepository(Match).createQueryBuilder("match")
            .leftJoinAndSelect("match.stage", "stage")
            .leftJoinAndSelect("stage.config", "tournament")
            .where("match.id=" + savedMatch.id)
            .getOne().then(match => {
            if (!match.stage.config.id) {
                return;
            }

            AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournament")
                .leftJoinAndSelect("tournament.stageConfigs", "stageConfigs")
                .leftJoinAndSelect("stageConfigs.matches", "matches")
                .leftJoinAndSelect("matches.opponents", "opponents")
                .leftJoinAndSelect("opponents.user", "opponentuser")
                .leftJoinAndSelect("opponents.team", "opponentteam")
                .where("tournament.id=" + match.stage.config.id)
                .getOne().then(tournament => {
                if (tournament) {
                    let iMatchTokens: IMatchToken[] = TcUtils.updateNextStage(tournament, match.bracket, match.phase, match.stage.order);

                    let promises: Array<Promise<IMatchToken>> = [];
                    iMatchTokens.forEach(iMatchToken => {
                        promises.push(new Promise<IMatchToken>((resolve, reject) => {
                            if (!iMatchToken.user && !iMatchToken.team) {
                                iMatchToken.token = MatchFactory.EMPTY_ENTRY.token;
                                resolve(iMatchToken);
                            } else {
                                if (tournament.isATeamTournament) {
                                    AppInstance.entityManager.findOne(Team, iMatchToken.team.id)
                                        .then(team => {
                                            iMatchToken.team = team;
                                            resolve(iMatchToken)
                                        })
                                        .catch((error) => {
                                            console.log(error)
                                            reject(new InternalServerError())
                                        });
                                } else {
                                    AppInstance.entityManager.findOne(User, iMatchToken.user.id)
                                        .then(user => {
                                            iMatchToken.user = user;
                                            resolve(iMatchToken)
                                        })
                                        .catch((error) => {
                                            reject(new InternalServerError())
                                        });
                                }
                            }
                        }));
                    })

                    Promise.all(promises).then(tokens => {
                        AppInstance.entityManager.save(MatchToken, tokens)
                            .then(savedToken => {
                                // If last match in phase, update full tournament
                                let thisStage = tournament.stageConfigs.filter(stage => stage.order == match.stage.order)[0];
                                let matches = thisStage.matches.filter(m => m.phase == match.phase);

                                if (TcUtils.allFinished(matches)) {
                                    MatchController.updateFullTournament(tournament.id, match.stage.order, match.phase);
                                }
                            })
                            .catch(
                                error => {
                                    if (AppInstance.config.env === 'development') {
                                        console.log(error);
                                    }
                                }
                            )
                    }).catch(error => {
                        console.log(error);
                    });
                } else {
                    console.log("Error: Tournament not found");
                }
            })
                .catch(
                    error => {
                        if (AppInstance.config.env === 'development') {
                            console.log(error);
                        }
                    }
                )
        })
            .catch(error => {
                if (AppInstance.config.env === 'development') {
                    console.log(error);

                } else {

                }
            })
    }
}
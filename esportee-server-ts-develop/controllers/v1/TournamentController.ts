import {Body, Get, JsonController, Param, Post, Req, Put, UseBefore} from "routing-controllers";
import {AppInstance} from "../../app";
import {AuthorizationMiddleware} from "./utils/AuthorizationMiddleware";
import {InternalServerError} from "./entities/responses/InternalServerError";
import {SuccessResponse} from "./entities/responses/SuccessResponse";
import {BadRequest} from "./entities/responses/BadRequest";
import {TournamentConfig} from "../../models/TournamentConfig";
import {Invitation} from "../../models/Invitation";
import {MatchToken} from "../../models/MatchToken";
import {User} from "../../models/User";
import {Team} from "../../models/Team";
import {ApiResponseFilter} from "./utils/ApiResponseFilter";
import {MatchFactory, MatchState, TcUtils, TournamentConfig as TCTournamentConfig, ITournamentConfig, TournamentFactory} from "tournament-creator-ts";
import {MatchController} from "./MatchController";
import {ParticipantStatController} from "./ParticipantStatController";
import {Venue} from "../../models/Venue";

@JsonController()
export class TournamentController {
    @Post("/tournaments/")
    @UseBefore(AuthorizationMiddleware)
    createTournament(@Body() tournament: TCTournamentConfig, @Req() request: any) {
        return new Promise((resolve, reject) => {
            let errors = TCTournamentConfig.validate(tournament);

            if (Object.keys(errors).length === 0) {
                tournament.userId = request.authenticatedUser;
                tournament.status = "pending";

                tournament.venueIds = [];
                if (tournament.type == 'offline') {
                    AppInstance.entityManager.findOne(User, tournament.userId)
                    .then(user => {
                        let promises: Array<Promise<Venue>> = [];
                        tournament.venues.forEach(venue => {
                            promises.push(new Promise<Venue>((resolve, reject) => {
                                if (venue.id == -1) {
                                    let newVenue = new Venue();
                                    newVenue.user = user;
                                    newVenue.name = venue.name;
                                    AppInstance.entityManager.save(Venue, newVenue)
                                    .then(venueDb => {
                                        resolve(venueDb)
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                        reject(new InternalServerError())
                                    });
                                } else {
                                    AppInstance.entityManager.findOne(Venue, venue.id)
                                    .then(venueDb => {
                                        resolve(venueDb)
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                        reject(new InternalServerError())
                                    });
                                }
                            }));
                        })

                        Promise.all(promises)
                            .then(venues => {
                                for (let venue of venues) {
                                    tournament.venueIds.push(venue.id);
                                }

                                AppInstance.entityManager.save(TournamentConfig, tournament)
                                    .then(savedTournament => resolve(new SuccessResponse(savedTournament.id)))
                                    .catch(
                                        error => {
                                            if (AppInstance.config.env === 'development') {
                                                resolve(new InternalServerError(error));
                                                console.log(error);
                                            } else {
                                                resolve(new InternalServerError());
                                            }
                                        }
                                    );
                        }).catch(error => {
                            console.log(error);
                        });
                    })
                    .catch(error => {
                        console.log(error)
                        reject(new InternalServerError())
                        return;
                    })
                } else {
                    AppInstance.entityManager.save(TournamentConfig, tournament)
                    .then(savedTournament => resolve(new SuccessResponse(savedTournament.id)))
                    .catch(
                        error => {
                            if (AppInstance.config.env === 'development') {
                                resolve(new InternalServerError(error));
                                console.log(error);
                            } else {
                                resolve(new InternalServerError());
                            }
                        }
                    );
                }
            } else {
                resolve(new BadRequest("config invalid"));
            }
        })
    }

    @Put("/tournaments/")
    @UseBefore(AuthorizationMiddleware)
    editTournament(@Body() tournament: TCTournamentConfig, @Req() request: any) {
        return new Promise((resolve, reject) => {
            this.createTournament(tournament, request).then(response => {
                resolve(response);
            })
        })
    }

    @Get("/tournaments/:id/invitations")
    @UseBefore(AuthorizationMiddleware)
    getInvitations(@Param("id") id: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(Invitation).createQueryBuilder("token")
                .leftJoin("token.tournamentConfig", "tournamentConfig")
                .leftJoinAndSelect("token.user", "user")
                .leftJoinAndSelect("token.team", "team")
                .where("tournamentConfig.id=" + id)
                .getMany()
                .then(ApiResponseFilter.filter)
                .then(invitations => resolve(new SuccessResponse(invitations)))
                .catch(
                error => {
                    if (AppInstance.config.env === 'development') {
                        console.log(error);
                        resolve(new InternalServerError(error));
                    } else {
                        resolve(new InternalServerError());
                    }
                });
        });
    }

    @Get("/tournaments/:id")
    @UseBefore(AuthorizationMiddleware)
    get(@Param("id") id: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournament")
                .leftJoinAndSelect("tournament.participantStats", "participantStats")
                .leftJoinAndSelect("participantStats.user", "user")
                .leftJoinAndSelect("participantStats.team", "team")
                .leftJoinAndSelect("tournament.stageConfigs", "stageConfigs")
                .leftJoinAndSelect("stageConfigs.matches", "matches")
                .leftJoinAndSelect("matches.venue", "venue")
                .leftJoinAndSelect("matches.opponents", "opponents")
                .orderBy("opponents.advantage", "DESC")
                .leftJoinAndSelect("opponents.user", "opponentuser")
                .leftJoinAndSelect("opponents.team", "opponentteam")
                .where("tournament.id=" + id)
                .getOne()
                .then(ApiResponseFilter.filter)
                .then(tournament => resolve(new SuccessResponse(tournament))).catch(
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

    @Get("/tournaments/edit/:id")
    @UseBefore(AuthorizationMiddleware)
    getTournamentToEdit(@Param("id") id: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournament")
                .leftJoinAndSelect("tournament.stageConfigs", "stageConfigs")
                .where("tournament.id=" + id)
                .getOne()
                .then(tournament => {
                    AppInstance.entityManager.findByIds(Venue, tournament.venueIds)
                    .then(venues => {
                        let returnObject;
                        returnObject = tournament;
                        returnObject.venues = venues;
                        resolve(new SuccessResponse(returnObject));
                    })
                    .catch(
                    error => {
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

    @Get("/tournaments/:id/isUserRegistered/:userId")
    @UseBefore(AuthorizationMiddleware)
    isUserRegistered(@Param("id") id: string, @Param("userId") userId: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(Invitation).createQueryBuilder("token")
                .leftJoinAndSelect("token.tournamentConfig", "tournamentConfig")
                .leftJoinAndSelect("token.user", "user")
                .where("tournamentConfig.id=" + id)
                .andWhere("user.id=" + userId)
                .getOne()
                .then(invitation => {
                    if (invitation) {
                        resolve(new SuccessResponse(true))
                    } else {
                        resolve(new SuccessResponse(false))
                    }
                })
                .catch(
                error => {
                    if (AppInstance.config.env === 'development') {
                        console.log(error);
                        resolve(new InternalServerError(error));
                    } else {
                        resolve(new InternalServerError());
                    }
                });
        });
    }

    @Get("/tournaments/:id/isTeamRegistered/:teamId")
    @UseBefore(AuthorizationMiddleware)
    isTeamRegistered(@Param("id") id: string, @Param("teamId") teamId: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(Invitation).createQueryBuilder("token")
                .leftJoinAndSelect("token.tournamentConfig", "tournamentConfig")
                .leftJoinAndSelect("token.team", "team")
                .where("tournamentConfig.id=" + id)
                .andWhere("team.id=" + teamId)
                .getOne()
                .then(invitation => {
                    if (invitation) {
                        resolve(new SuccessResponse(true))
                    } else {
                        resolve(new SuccessResponse(false))
                    }
                })
                .catch(
                error => {
                    if (AppInstance.config.env === 'development') {
                        console.log(error);
                        resolve(new InternalServerError(error));
                    } else {
                        resolve(new InternalServerError());
                    }
                });
        });
    }

    @Get("/tournaments/game/:gameId")
    @UseBefore(AuthorizationMiddleware)
    getTournamentsForGame(@Param("gameId") gameId: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournament")
                .where("tournament.gameId=" + gameId)
                .getMany().then(tournaments => {
                    resolve(new SuccessResponse(tournaments))
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

    @Get("/tournaments/user/:id")
    @UseBefore(AuthorizationMiddleware)
    getTournamentsFromUser(@Param("id") id: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournament")
                .where("tournament.userId=" + id)
                .getMany().then(tournament => resolve(new SuccessResponse(tournament))).catch(
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

    @Get("/tournaments/hosted/user/:id")
    @UseBefore(AuthorizationMiddleware)
    getTournamentFromUser(@Param("id") id: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournament")
                .where("tournament.userId=" + id)
                .getMany().then(tournament => resolve(new SuccessResponse(tournament))).catch(
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

    @Get("/tournaments/participate/user/:id")
    @UseBefore(AuthorizationMiddleware)
    getParticipatedTournamentsFromUser(@Param("id") id: string) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(MatchToken).createQueryBuilder("matchToken")
                .leftJoinAndSelect("matchToken.user","user")
                .leftJoinAndSelect("matchToken.match","match")
                .leftJoinAndSelect("match.stage","stage")
                .leftJoinAndSelect("stage.config","tournament")
                .where("user.id=" + id)
                .getMany().then(matchTokens => {
                    let tournamentsIds: number[] = [];
                    let tournaments: ITournamentConfig[] = [];

                    for (let matchToken of matchTokens) {
                        if (matchToken.match) {
                            if (tournamentsIds.indexOf(matchToken.match.stage.config.id) < 0) {
                                tournamentsIds.push(matchToken.match.stage.config.id)
                                tournaments.push(matchToken.match.stage.config);
                            }
                        }
                    }
                    resolve(new SuccessResponse(tournaments));
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

    @Put("/startTournament/")
    @UseBefore(AuthorizationMiddleware)
	put( @Body() body: {tId: string}, @Req() request: any) {
		return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournamentcfg")
            .leftJoinAndSelect("tournamentcfg.invitations", "invitations")
            .leftJoinAndSelect("invitations.user", "user")
            .leftJoinAndSelect("invitations.team", "team")
            .leftJoinAndSelect("tournamentcfg.stageConfigs", "stageConfigs")
            .orderBy("stageConfigs.order", "ASC")
            .where("tournamentcfg.id=" + body.tId)
            .getOne()
            .then(config => {
                if (config) {
                    let confirmedInvitations1 = config.invitations.filter(invitation => invitation.status == "confirmed");
                    let firstStage1 = config.stageConfigs.filter(stage => stage.order == 0)[0];
                    if (confirmedInvitations1.length < 2) {
                        resolve(new InternalServerError("Please add some invitations, minimum is 2."));
                        return;
                    }
                    else if (confirmedInvitations1.length > firstStage1.nrParticipants) {
                        resolve(new InternalServerError("Too many invitations, please delete "+(confirmedInvitations1.length-firstStage1.nrParticipants)));
                        return;
                    }
                    
                    for (let stageConfig of config.stageConfigs) {
                        if (stageConfig.nrParticipants > confirmedInvitations1.length) {
                            stageConfig.nrParticipants = confirmedInvitations1.length
                        }
                    }

                    AppInstance.entityManager.findByIds(Venue, config.venueIds)
                    .then(venues => {
                        let tournament = new TCTournamentConfig(config, venues);
                        let tournamentCreated = TournamentFactory.createTournament(tournament, false);

                        for (let stageConfig of tournamentCreated.stageConfigs) {
                            for (let match of stageConfig.matches) {
                                delete match.id;
                                match.stage = stageConfig;
                            }
                        }
                        delete tournamentCreated.venues;
                        tournamentCreated.venueIds = config.venueIds;
                        
                        AppInstance.entityManager.save(TournamentConfig, tournamentCreated)
                        .then(savedTournament => {
                            AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournament")
                            .leftJoinAndSelect("tournament.invitations", "invitations")
                            .leftJoinAndSelect("invitations.user", "user")
                            .leftJoinAndSelect("invitations.team", "team")
                            .leftJoinAndSelect("tournament.stageConfigs", "stageConfigs")
                            .orderBy("stageConfigs.order", "ASC")
                            .leftJoinAndSelect("stageConfigs.matches", "matches")
                            .leftJoinAndSelect("matches.opponents", "opponents")
                            .leftJoinAndSelect("opponents.user", "opponentuser")
                            .leftJoinAndSelect("opponents.team", "opponentteam")
                            .where("tournament.id=" + savedTournament.id)
                            .getOne()
                            .then(tournamentFull => {
                                if (tournamentFull) {
                                    let firstStage = tournamentFull.stageConfigs.filter(stage => stage.order == 0)[0];
                                    let confirmedInvitations = tournamentFull.invitations.filter(invitation => invitation.status == "confirmed");
                                    let tokenMapping: {token: string, participant: User|Team}[] = [];
                                    let index = 0;

                                    // Build token -> user mapping
                                    for (let match of firstStage.matches.filter(match => match.phase == 0)) {
                                        for (let opponent of match.opponents) {
                                            if (opponent.token == MatchFactory.EMPTY_ENTRY.token) {
                                                continue;
                                            }

                                            let found = false;
                                            tokenMapping.forEach(el => {
                                                if (el.token == opponent.token) {
                                                    found = true;
                                                }
                                            });

                                            if (!found) {
                                                let confirmedParticipant: User|Team;
                                                if (index < confirmedInvitations.length) {
                                                    if (tournamentFull.isATeamTournament) {
                                                        confirmedParticipant = confirmedInvitations[index++].team;
                                                    } else {
                                                        confirmedParticipant = confirmedInvitations[index++].user;
                                                    }
                                                } else {
                                                    // if too less invitations -> fill up with empty ones
                                                    confirmedParticipant = null;
                                                }
                                                tokenMapping.push({token: opponent.token, participant: confirmedParticipant})
                                            }
                                        }
                                    }

                                    // For each token set the right user
                                    for (let match of firstStage.matches.filter(match => match.phase == 0)) {
                                        for (let opponent of match.opponents) {
                                            tokenMapping.forEach(el => { 
                                                if (el.token == opponent.token) {
                                                    if (tournamentFull.isATeamTournament) {
                                                        opponent.team = <Team>el.participant;
                                                    } else {
                                                        opponent.user = <User>el.participant;
                                                    }

                                                    if (opponent.user == null && opponent.team == null) {
                                                        opponent.token = MatchFactory.EMPTY_ENTRY.token;
                                                    }
                                                }
                                            });

                                            if (opponent.token == MatchFactory.EMPTY_ENTRY.token) {
                                                match.status = MatchState.WILDCARD;
                                            }
                                        }
                                    }

                                    tournamentFull.status = "running";
                                    AppInstance.entityManager.save(TournamentConfig, tournamentFull)
                                    .then(savedTournament => {
                                        MatchController.updateFullTournament(tournamentFull.id, 0, 0);
                                        resolve(new SuccessResponse(true))
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
                                    resolve(new InternalServerError("Tournament does not exists"));
                                }
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
                            console.log(error)
                            if (AppInstance.config.env === 'development') {
                                resolve(new InternalServerError(error));
                            } else {
                                resolve(new InternalServerError());
                            }
                        })
                    })
                    .catch(error => {
                        resolve(new InternalServerError("Venues does not exists"));
                        return;
                    })
                } else {
                    resolve(new InternalServerError("Tournament does not exists"));
                    return;
                }
            })
            .catch(error => {
                if (AppInstance.config.env === 'development') {
                    resolve(new InternalServerError(error));
                } else {
                    resolve(new InternalServerError());
                }
                console.log(error)
            })
		})
    }
    
    public static checkTournamentFinished(tournamentId: number) {
        AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournament")
            .leftJoinAndSelect("tournament.stageConfigs", "stageConfigs")
            .leftJoinAndSelect("stageConfigs.matches", "matches")
            .leftJoinAndSelect("matches.opponents", "opponents")
            .leftJoinAndSelect("opponents.user", "opponentuser")
            .leftJoinAndSelect("opponents.team", "opponentteam")
            .where("tournament.id=" + tournamentId)
            .getOne().then(tournament => {
                if (tournament) {
                    let allFinished = true;
                    for (let stage of tournament.stageConfigs) {
                        allFinished = TcUtils.allFinished(stage.matches);
                        if (!allFinished) break;
                    }

                    if (allFinished) {
                        // console.log("tournament is finished!!")
                        tournament.status = "finished";

                        AppInstance.entityManager.save(TournamentConfig, tournament)
                            .then(savedTournament => {
                                ParticipantStatController.createParticipantStat(tournament);
                            })
                            .catch(
                            error => {
                                if (AppInstance.config.env === 'development') {
                                    console.log(error)
                                }
                            })
                    }
                } else {
                    console.log("Error: Tournament not found");
                }
            })
            .catch(
                error => {
                    if (AppInstance.config.env === 'development') {
                        console.log(error);
                    }
                })
    }
}
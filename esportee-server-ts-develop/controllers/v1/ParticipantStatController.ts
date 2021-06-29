import {Get, JsonController, UseBefore, Param} from "routing-controllers";
import {AppInstance} from "../../app";
import {AuthorizationMiddleware} from "./utils/AuthorizationMiddleware";
import {InternalServerError} from "./entities/responses/InternalServerError";
import {SuccessResponse} from "./entities/responses/SuccessResponse";
import {ApiResponseFilter} from "./utils/ApiResponseFilter";
import {ParticipantStat} from "../../models/ParticipantStat";
import {TournamentConfig} from "../../models/TournamentConfig";
import {User} from "../../models/User";
import {Team} from "../../models/Team";
import {MatchFactory, tableEntry, TcUtils, sortRule} from "tournament-creator-ts";

@JsonController()
export class ParticipantStatController {
    @Get("/participantStat/user/:id")
    @UseBefore(AuthorizationMiddleware)
    getParticipantStatForUser(@Param("id") id: number) {
        return new Promise((resolve, reject) => {
          AppInstance.connection.getRepository(ParticipantStat).createQueryBuilder("participantStat")
            .leftJoinAndSelect("participantStat.tournamentConfig", "tournament")
            .leftJoinAndSelect("participantStat.user", "user")
            .where("user.id=" + id)
            .getMany()
            .then(ApiResponseFilter.filter)
            .then(participantStat => resolve(new SuccessResponse(participantStat))).catch(
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

    @Get("/participantStat/team/:id")
    @UseBefore(AuthorizationMiddleware)
    getParticipantStatForTeam(@Param("id") id: number) {
        return new Promise((resolve, reject) => {
          AppInstance.connection.getRepository(ParticipantStat).createQueryBuilder("participantStat")
            .leftJoinAndSelect("participantStat.tournamentConfig", "tournament")
            .leftJoinAndSelect("participantStat.team", "team")
            .where("team.id=" + id)
            .getMany()
            .then(ApiResponseFilter.filter)
            .then(participantStat => resolve(new SuccessResponse(participantStat))).catch(
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

    // TODO: this is only for Testing!!
    @Get("/participantStat/testCreateRatingFunction/:id")
    @UseBefore(AuthorizationMiddleware)
    testCreateRatingFunction(@Param("id") id: number) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(TournamentConfig).createQueryBuilder("tournament")
            .leftJoinAndSelect("tournament.stageConfigs", "stageConfigs")
            .leftJoinAndSelect("stageConfigs.matches", "matches")
            .leftJoinAndSelect("matches.opponents", "opponents")
            .leftJoinAndSelect("opponents.user", "opponentuser")
            .leftJoinAndSelect("opponents.team", "opponentteam")
            .where("tournament.id=" + id)
            .getOne().then(tournament => {
                ParticipantStatController.createParticipantStat(tournament);
                resolve(new SuccessResponse())
            }).catch(
                error => {
                    resolve(new InternalServerError(error))
                }
            )
        });
    }

    public static createParticipantStat(tournament: TournamentConfig) {
        if (tournament.status != "finished") {
            console.log("Error: Tournament is not finished!");
            return;
        }

        let participantStats: ParticipantStat[] = [];
        let rank = 1;
        let firstStage = tournament.stageConfigs.filter(stage => stage.order == 0)[0];
        let tournamentReduced= Object.assign({}, tournament);
        delete tournamentReduced.stageConfigs;
        delete tournamentReduced.invitations;
        delete tournamentReduced.gameSettings;   
        delete tournamentReduced.address;    

        let sortRule: sortRule[] = [
            {pos: 0, rule: "points",},
            {pos: 1, rule: "difference"},
            {pos: 2, rule: "for"}, 
            {pos: 3, rule: "points hth",},
            {pos: 4, rule: "difference hth",},
            {pos: 5, rule: "for hth",},
            {pos: 6, rule: "random",}
          ];
        
        // get participants list
        let participantIds: number[] = [];
        for (let match of firstStage.matches.filter(match => match.phase == 0)) {
            for (let opponent of match.opponents) {
                if (opponent.token != MatchFactory.EMPTY_ENTRY.token && (opponent.user || opponent.team)) {
                    let id = opponent.user ? opponent.user.id : opponent.team.id;
                    if (participantIds.indexOf(id) < 0) {
                        participantIds.push(id);
                    }
                }
            }
        }

        let classType;
        if (tournament.isATeamTournament) {
            classType = Team;
        } else {
            classType = User;
        }
        AppInstance.entityManager.findByIds(classType, participantIds)
            .then((participants) => {
                participantIds.forEach(participantId => {
                    let participantStat = new ParticipantStat;
                    participantStat.rank = -1;
                    participantStat.played = 0;
                    participantStat.won = 0;
                    participantStat.draw = 0;
                    participantStat.lost = 0;
                    participantStat.for = 0;
                    participantStat.against = 0;
                    participantStat.tournamentConfig = tournamentReduced;

                    let participant = ParticipantStatController.findElement(participants, "id", participantId);
                    if (tournament.isATeamTournament) {
                        participantStat.team = participant;
                    } else {
                        participantStat.user = participant;
                    }

                    participantStats.push(participantStat);
                })

                // get stageConfigs from end to begin
                let stageConfigsDesc = TcUtils.sortByKey(tournament.stageConfigs, "order", "descending");

                for (let stage of stageConfigsDesc) {
                    let maxPhase = Math.max.apply(Math, stage.matches.map(match => match.phase));

                    for (let phase = maxPhase; phase >= 0; phase--) {
                        let sortedTable: tableEntry[] = [];
                        let matchesPhase = stage.matches.filter(match => match.phase == phase);
                        let maxBrackets = Math.max.apply(Math, matchesPhase.map(match => match.bracket));

                        // concatenate all sortedTables in one phase
                        for (let bracket = 0; bracket <= maxBrackets; bracket++) {
                            let sortedTable_b = TcUtils.getSortedTable(matchesPhase.filter(match => match.bracket == bracket), sortRule, stage.id);
                            sortedTable = sortedTable.concat(sortedTable_b);
                        }
                        sortedTable = TcUtils.sortByKey(sortedTable, "pos", "ascending");

                        for (let entry of sortedTable) {
                            let idx;
                            if (tournament.isATeamTournament) {
                                idx = participantStats.findIndex(participant => participant.team.id == entry.id);
                            } else {
                                idx = participantStats.findIndex(participant => participant.user.id == entry.id);
                            }
                            
                            if (idx >= 0) {
                                if (participantStats[idx].rank == -1) {
                                    participantStats[idx].rank = rank++;
                                }

                                participantStats[idx].played += entry.played;
                                participantStats[idx].won += entry.won;
                                participantStats[idx].draw += entry.draw;
                                participantStats[idx].lost += entry.lost;
                                participantStats[idx].for += entry.for;
                                participantStats[idx].against += entry.against;
                            }
                        }
                    }
                }

                AppInstance.entityManager.save(participantStats)
                    .then(participantStats => new SuccessResponse(true))
                    .catch((error) => new InternalServerError(error));
            })
            .catch((error) => new InternalServerError(error));
    }

    static findElement(arr, propName, propValue) {
        for (var i = 0; i < arr.length; i++)
            if (arr[i][propName] == propValue)
                return arr[i];
    }
}
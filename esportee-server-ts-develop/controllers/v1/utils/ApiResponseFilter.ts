import {MatchToken} from "../../../models/MatchToken";
import {IMatchToken} from "tournament-creator-ts/src/interfaces/IMatchToken";
import {Match} from "../../../models/Match";
import {User} from "../../../models/User";
import {Team} from "../../../models/Team";
import {TournamentConfig} from "../../../models/TournamentConfig";
import {StageConfig} from "../../../models/StageConfig";
import {Invitation} from "../../../models/Invitation";
import {ParticipantStat} from "../../../models/ParticipantStat";
import {InvitationReturnObject} from "../../../public/returnObjects/returnObjects";

export class ApiResponseFilter {
    static filter(input: any): any {
        if (Array.isArray(input) && input.length > 0 && input[0] instanceof MatchToken) {
            return ApiResponseFilter.filterMatchTokens(input);
        } else if (Array.isArray(input) && input.length > 0 && input[0] instanceof Match) {
            return ApiResponseFilter.filterMatches(input);
        } else if (Array.isArray(input) && input.length > 0 && input[0] instanceof Invitation) {
            return ApiResponseFilter.filterInvitations(input);
        } else if (Array.isArray(input) && input.length > 0 && input[0] instanceof Team) {
            return ApiResponseFilter.filterTeams(input);
        } else if (Array.isArray(input) && input.length > 0 && input[0] instanceof ParticipantStat) {
            return ApiResponseFilter.filterParticipantStats(input);
        } else if (input instanceof Match) {
            return ApiResponseFilter.filterMatch(input);
        } else if (input instanceof TournamentConfig) {
            return ApiResponseFilter.filterTournament(input);
        } else if (input instanceof Invitation) {
            return ApiResponseFilter.filterInvitation(input);
        } else if (input instanceof Team) {
            return ApiResponseFilter.filterTeam(input);
        } else if (input instanceof ParticipantStat) {
            return ApiResponseFilter.filterParticipantStat(input);
        } else {
            console.log("nothing to filter: "+JSON.stringify(input))
            return input;
        }
    }

    static filterMatchTokens(tokens: MatchToken[]): IMatchToken[] {
        return tokens.map(token => {
            let apiToken: IMatchToken = {
                token: token.token,
                score: token.score,
                advantage: token.advantage,
                resultApprovedTimestamp: token.resultApprovedTimestamp,
                user: undefined,
                team: undefined
            };
            if (token.user) {
                apiToken.user = {username: token.user.username, id: token.user.id};
            }
            if (token.team) {
                apiToken.team = {name: token.team.name, id: token.team.id};
            }
            return apiToken;
        });
    }

    static filterMatches(matches: Match[]): Match[] {
        matches.forEach(match => {
            match.opponents.forEach(opponent => {
                opponent.user = ApiResponseFilter.filterUser(opponent.user);
            })
        });
        return matches;
    }

    static filterTeams(teams: Team[]): Team[] {
        teams.forEach(team => {
            team = ApiResponseFilter.filterTeam(team);
        });
        return teams;
    }

    static filterMatch(match: Match): Match {
        let opponents: MatchToken[] = [];
        match.opponents.map(token => {
            let apiToken: MatchToken = {
                id: token.id,
                match: undefined,
                token: token.token,
                score: token.score,
                advantage: token.advantage,
                resultApprovedTimestamp: token.resultApprovedTimestamp,
                user: undefined,
                team: undefined
            };
            delete apiToken.match;
            if (token.user) {
                apiToken.user = ApiResponseFilter.filterUser(token.user);
            }
            if (token.team) {
                apiToken.team = ApiResponseFilter.filterTeam(token.team);
            }
            opponents.push(apiToken);
        });
        match.opponents = opponents;
        return match;
    }

    static filterUser(user: User): User {
        delete user.email;
        delete user.invitations;
        delete user.lastlogin;
        delete user.matchTokens;
        delete user.password;
        delete user.teammembers;
        delete user.userLevel;
        
        return user;
    }

    static filterTeam(team: Team): Team {
        delete team.invitations;
        delete team.matchTokens;
        if (team.teammembers) {
            team.teammembers.forEach(teammember => {
                teammember.user = ApiResponseFilter.filterUser(teammember.user);
            })
        }
        
        return team;
    }

    static filterTournament(tournament: TournamentConfig): TournamentConfig {
        let configs: StageConfig[] = [];
        tournament.stageConfigs.map(config => {
            let matches: Match[] = [];
            config.matches.map(match => {
                matches.push(ApiResponseFilter.filterMatch(match));
            });
            config.matches = matches;
            configs.push(config);
        });
        tournament.stageConfigs = configs;
        tournament.participantStats = ApiResponseFilter.filterParticipantStats(tournament.participantStats);
        return tournament;
    }

    static filterInvitations(invitations: Invitation[]): InvitationReturnObject[] {
        let invitationReturnObjects: InvitationReturnObject[] = [];
        invitations.forEach(invitation => {
            invitationReturnObjects.push(this.filterInvitation(invitation));
        });
        return invitationReturnObjects;
    }

    static filterInvitation(invitation: Invitation): InvitationReturnObject {
        let invitationReturnObject: InvitationReturnObject = {
            token: invitation.token,
            status: invitation.status,
            user: {
                id: invitation.user? invitation.user.id : -1,
                name: invitation.user? invitation.user.username : ""
            },
            team: {
                id: invitation.team? invitation.team.id : -1,
                name: invitation.team? invitation.team.name : ""
            },
            tournamentConfig: {
                id: invitation.tournamentConfig? invitation.tournamentConfig.id : -1,
                name: invitation.tournamentConfig? invitation.tournamentConfig.name : ""
            },
            type: invitation.invitationType
        }
        return invitationReturnObject;
    }

    static filterParticipantStats(participantStats: ParticipantStat[]): ParticipantStat[] {
        participantStats.forEach(participantStat => {
            participantStat = ApiResponseFilter.filterParticipantStat(participantStat);
        })
        return participantStats;
    }

    static filterParticipantStat(participantStat: ParticipantStat): ParticipantStat {
        if (participantStat.user) {
            participantStat.user = ApiResponseFilter.filterUser(participantStat.user);
        }
        if (participantStat.team) {
            participantStat.team = ApiResponseFilter.filterTeam(participantStat.team);
        }
        return participantStat;
    }
}

export interface PublicUser {
    username: string;
    id: string;
}
import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {ApiResponse} from './responses/api-response';
import {TokenResponse} from './responses/token-response.interface';
import {EntityIdResponse} from './responses/entity-id-response.interface';
import {IUserInfo} from './responses/userinfo.interface';
import {Game} from '../models/game.model';
import {IMatch, IMatchToken, ITournamentConfig} from 'tournament-creator-ts';
import {Invitation} from './responses/invitation.interface';
import {ApiUser} from './responses/api-user.interface';
import {Team} from '../models/team.model';
import {ParticipantStat} from '../models/participantStat.model';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {WebsocketService} from '../services/websocket.service';

export enum InvitationType {
  ADD_USER_TOURNAMENT,
  ADD_TEAM_TOURNAMENT,
  JOIN_TEAM,
  REGISTER_USER_TOURNAMENT,
  REGISTER_TEAM_TOURNAMENT
}

const server = '//localhost:3000';
const baseUrl = server + '/api';
const gameUrls = {
  list: baseUrl + '/games',
  get: function (urlParam) {
    return baseUrl + '/games/' + encodeURI(urlParam)
  },
  getGameById: function (id: string) {
    return baseUrl + '/game/' + encodeURI(id)
  },
  createGameCoverImageUrl: function (shortName) {
    return server + '/games/images/' + encodeURI(shortName) + '_cover.png';
  }
};

const tournamentUrls = {
  create: baseUrl + '/tournaments',
  edit: baseUrl + '/tournaments',
  get: baseUrl + '/tournaments/',
  getToEdit: baseUrl + '/tournaments/edit/',
  getTournamentByMatch: function (id: string) {
    return baseUrl + '/tournaments/match/' + id;
  },
  getTournamentsFromUser: function (id: string) {
    return baseUrl + '/tournaments/user/' + id;
  },
  getHostedTournamentsFromUser: function (id: string) {
    return baseUrl + '/tournaments/hosted/user/' + id;
  },
  getParticipatedTournamentsFromUser: function (id: string) {
    return baseUrl + '/tournaments/participate/user/' + id;
  },
  getInvitations: function (id: string) {
    return baseUrl + '/tournaments/' + id + '/invitations';
  },
  getTournamentsForGame: function (gameId: string) {
    return baseUrl + '/tournaments/game/' + gameId;
  },
  isUserRegistered: function (id: string, userId: string) {
    return baseUrl + '/tournaments/' + id + '/isUserRegistered/' + userId;
  },
  isTeamRegistered: function (id: string, teamId: string) {
    return baseUrl + '/tournaments/' + id + '/isTeamRegistered/' + teamId;
  },
  start: baseUrl + '/startTournament/'
};

const matchTokenUrls = {
  getUsersByMatchTokens: function (tokens: string[]) {
    return baseUrl + '/matchtokens/' + encodeURIComponent(JSON.stringify(tokens));
  }
};

const matchUrls = {
  get: baseUrl + '/match/',
  update: baseUrl + '/match/',
  approve: baseUrl + '/match/approveresult',
  submitResult: baseUrl + '/match/result',
  disputeResult: baseUrl + '/match/disputeresult',
  getMatchesFromUser: function (id: string) {
    return baseUrl + '/matches/user/' + id;
  }
};

const invitationUrls = {
  get: baseUrl + '/invitation/',
  create: baseUrl + '/invitation/',
  delete: baseUrl + '/invitation/',
  update: baseUrl + '/invitation/'
};

const userUrls = {
  create: baseUrl + '/users',
  getUser: baseUrl + '/users',
  getUserById: function (uid: string) {
    return baseUrl + '/users/id/' + uid;
  },
  login: baseUrl + '/users/login',
  logout: baseUrl + '/users/logout',
  updateFcmToken: baseUrl + '/users/updatefcm',
  confirmMail: baseUrl + '/users/confirm',
  editUser: function (userId: number) {
    return baseUrl + '/users/' + userId;
  }
};

const teamUrls = {
  get: baseUrl + '/teams/',
  create: baseUrl + '/team/',
  delete: baseUrl + '/teammember/',
  update: baseUrl + '/team/',
  getTeamsByUser: baseUrl + '/teams/user/',
  getTeamsByUserId(userId: string) {
    return baseUrl + '/teams/by/user/' + userId;
  },
  getTeamById(teamId: string) {
    return baseUrl + '/team/' + teamId;
  },
  getInvitations(teamId: string) {
    return baseUrl + '/team/' + teamId + '/invitations';
  }
};

const participantStatUrls = {
  getParticipantStatByUserid(userId: string) {
    return baseUrl + '/participantStat/user/' + userId;
  },
  getParticipantStatByTeamid(teamId: string) {
    return baseUrl + '/participantStat/team/' + teamId;
  }
};

@Injectable()
export class ApiClientService {
  public static readonly INTERNAL_SERVER_ERROR: ApiResponse<any> = {status: 500, statusText: 'INTERNAL SERVER ERROR'};

  private static handleError(error: HttpErrorResponse): ApiResponse<any> {
    switch (error.status) {
      default:
      case 500:
        return ApiClientService.INTERNAL_SERVER_ERROR;
    }
  }

  private static handleResponse<T>(response: HttpResponse<ApiResponseWrapper<T>>): ApiResponse<T> {
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.body.data
    };
  }

  public request<T>(method: string, url: string, options?: any): Observable<ApiResponse<T>> {
    const finalOptions = options || {};
    finalOptions.responseType = 'json';
    finalOptions.reportProgress = false;
    finalOptions.observe = 'response';
    return from(new Promise((resolve, reject) => {
      this.http.request<ApiResponseWrapper<T>>(method, url, finalOptions).subscribe(response => {
        console.log(response);
        resolve(ApiClientService.handleResponse<T>(<HttpResponse<ApiResponseWrapper<T>>> response)
        )
        ;
      }, error => {
        console.log(error);
        reject(ApiClientService.handleError(error));
      });
    }));
  }

  constructor(private http: HttpClient, private websocketService: WebsocketService) {
  }

  acceptInvitation(token: string): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('GET', baseUrl + '/invitation/accept/' + encodeURIComponent(token));
  }

  declineInvitation(token: string): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('GET', baseUrl + '/invitation/decline/' + encodeURIComponent(token));
  }

  getGames(): Observable<ApiResponse<Game[]>> {
    return from(new Promise((resolve, reject) => {
      this.request<Game[]>('GET', gameUrls.list).subscribe(
        gamesResponse => {
          let newData = gamesResponse.data.map(
            game => {
              game.coverImageUrl = gameUrls.createGameCoverImageUrl(game.urlParam);
              return game;
            }
          );
          gamesResponse.data = newData;
          resolve(gamesResponse);
        }, error => reject
      );
    }));
  }

  getGame(name: string): Observable<ApiResponse<Game>> {
    return from(new Promise((resolve, reject) => {
      this.request<Game>('GET', gameUrls.get(name)).subscribe(
        gameResponse => {
          gameResponse.data.coverImageUrl = gameUrls.createGameCoverImageUrl(gameResponse.data.urlParam);
          resolve(gameResponse);
        }, error => reject(ApiClientService.handleError(error)))
    }));
  }

  getGameById(id: string): Observable<ApiResponse<Game>> {
    return this.request<Game>('GET', gameUrls.getGameById(id))
      .map(gameResponse => {
        gameResponse.data.coverImageUrl = gameUrls.createGameCoverImageUrl(gameResponse.data.urlParam);
        return gameResponse;
      })
  }

  register(username, email, password): Observable<ApiResponse<EntityIdResponse>> {
    return this.request<EntityIdResponse>('POST', userUrls.create, {
      body: {
        user: {
          username: username,
          email: email,
          password: password
        }
      }
    });
  }

  login(email, password): Observable<ApiResponse<TokenResponse>> {
    return this.request<TokenResponse>('POST', userUrls.login, {
      body: {
        email: email,
        password: password
      }
    });
  }

  logout(): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('GET', userUrls.logout);
  }

  confirmEmail(email: string, token: string): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('GET', userUrls.confirmMail + '?email=' + encodeURIComponent(email)
      + '&token=' + encodeURIComponent(token));
  }

  loadUserProfile(userId: string): Observable<ApiResponse<IUserInfo>> {
    return this.request<IUserInfo>('GET', userUrls.getUser + '/id/' + userId);
  }

  getUserById(uid: string): Observable<ApiResponse<IUserInfo>> {
    return this.request<IUserInfo>('GET', userUrls.getUserById(uid));
  }

  editUser(user: IUserInfo): Observable<ApiResponse<IUserInfo>> {
    return this.request<IUserInfo>('PUT', userUrls.editUser(user.id), {body: user});
  }

  createTournament(form: ITournamentConfig): Observable<ApiResponse<number>> {
    delete form.id;
    delete form.venueIds;
    for (let i = 0; i < form.stageConfigs.length; i++) {
      delete form.stageConfigs[i].id;
      delete form.stageConfigs[i].matches;
    }

    return this.request<number>('POST', tournamentUrls.create, {body: form});
  }

  editTournament(form: ITournamentConfig): Observable<ApiResponse<number>> {
    for (let i = 0; i < form.stageConfigs.length; i++) {
      delete form.stageConfigs[i].id;
      delete form.stageConfigs[i].matches;
    }

    return this.request<number>('PUT', tournamentUrls.edit, {body: form});
  }

  getTournament(tournamentId: string): Observable<ApiResponse<ITournamentConfig>> {
    return this.request<ITournamentConfig>('GET', tournamentUrls.get + tournamentId);
  }

  getTournamentToEdit(tournamentId: string): Observable<ApiResponse<ITournamentConfig>> {
    return this.request<ITournamentConfig>('GET', tournamentUrls.getToEdit + tournamentId);
  }

  getTournamentsByUserId(userId: string): Observable<ApiResponse<ITournamentConfig[]>> {
    return this.request<ITournamentConfig[]>('GET', tournamentUrls.getTournamentsFromUser(userId));
  }

  getHostedTournamentsFromUser(userId: string): Observable<ApiResponse<ITournamentConfig[]>> {
    return this.request<ITournamentConfig[]>('GET', tournamentUrls.getHostedTournamentsFromUser(userId));
  }

  getParticipatedTournamentsFromUser(userId: string): Observable<ApiResponse<ITournamentConfig[]>> {
    return this.request<ITournamentConfig[]>('GET', tournamentUrls.getParticipatedTournamentsFromUser(userId));
  }

  getTournamentsForGame(gameId: string): Observable<ApiResponse<ITournamentConfig[]>> {
    return this.request<ITournamentConfig[]>('GET', tournamentUrls.getTournamentsForGame(gameId));
  }

  /*testCreateRatingFunction(tournamentId: string) {
    return this.createAuthHttp(this.http)
      .get(baseUrl + '/participantStat/testCreateRatingFunction/' + tournamentId);
  }*/

  getMatchesFromUser(userId: string): Observable<ApiResponse<IMatch[]>> {
    return this.request<IMatch[]>('GET', matchUrls.getMatchesFromUser(userId));
  }

  getTournamentByMatch(matchId: string): Observable<ApiResponse<string>> {
    return this.request<string>('GET', tournamentUrls.getTournamentByMatch(matchId));
  }

  startTournament(tournamentId: string): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('PUT', tournamentUrls.start, {body: {tId: tournamentId}});
  }

  isUserRegisteredForTournament(tournamentId: string, userId: string): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('GET', tournamentUrls.isUserRegistered(tournamentId, userId));
  }

  isTeamRegisteredForTournament(tournamentId: string, teamId: string): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('GET', tournamentUrls.isTeamRegistered(tournamentId, teamId));
  }

  getMatch(matchId: string): Observable<ApiResponse<IMatch>> {
    return this.request<IMatch>('GET', matchUrls.get + matchId);
  }

  updateMatch(match: IMatch): Observable<ApiResponse<IMatch>> {
    return this.request<IMatch>('PUT', matchUrls.update, {body: match});
  }

  getInvitationsByTournament(tournamentId: string): Observable<ApiResponse<Invitation[]>> {
    return this.request<Invitation[]>('GET', tournamentUrls.getInvitations(tournamentId));
  }

  getInvitationsByTeam(teamId: string): Observable<ApiResponse<Invitation[]>> {
    return this.request<Invitation[]>('GET', teamUrls.getInvitations(teamId));
  }

  getTeams(): Observable<ApiResponse<Team[]>> {
    return this.request<Team[]>('GET', teamUrls.get);
  }

  getTeamById(teamId: string): Observable<ApiResponse<Team>> {
    return this.request<Team>('GET', teamUrls.getTeamById(teamId));
  }

  getTeamsByUser(): Observable<ApiResponse<Team[]>> {
    return this.request<Team[]>('GET', teamUrls.getTeamsByUser);
  }

  getTeamsByUserId(userId: string): Observable<ApiResponse<Team[]>> {
    return this.request<Team[]>('GET', teamUrls.getTeamsByUserId(userId));
  }

  deleteTeammember(teammemberId: number): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('DELETE', teamUrls.delete + teammemberId);
  }

  createTeam(name: string): Observable<ApiResponse<Team>> {
    return this.request<Team>('POST', teamUrls.create, {body: {name: name}});
  }

  updateTeam(id: number, name: string): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('PUT', teamUrls.update, {body: {name: name}});
  }

  getUsersByMatchTokens(tokens: IMatchToken[]): Observable<ApiResponse<ApiUser>> {
    let apiTokens: string[] = [];
    tokens.map(token => apiTokens.push(token.token));
    return this.request<boolean>('GET', matchTokenUrls.getUsersByMatchTokens(apiTokens));
  }

  getInvitation(token: string): Observable<ApiResponse<Invitation>> {
    return this.request<Invitation>('GET', invitationUrls.get + token);
  }

  createInvitation(userEmail: string, userId: number, teamname: string, teamId: number,
                   tournamentId: number, type: InvitationType): Observable<ApiResponse<Invitation>> {
    let body = {
      userEmail: userEmail,
      userId: userId,
      teamname: teamname,
      teamId: teamId,
      tournamentId: tournamentId,
      type: type
    };

    return this.request<Invitation>('POST', invitationUrls.create, {body: body});
  }

  updateInvitation(token: string, status: string): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('PUT', invitationUrls.update, {body: {token: token, status: status}});
  }

  deleteInvitation(token: string): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('DELETE', invitationUrls.delete + token);
  }

  approveMatchResult(matchId: string): Observable<ApiResponse<IMatch>> {
    return this.request<Invitation>('POST', matchUrls.approve, {body: {id: matchId}});
  }

  submitMatchResult(match: IMatch): Observable<ApiResponse<IMatch>> {
    return this.request<IMatch>('POST', matchUrls.submitResult, {body: match});
  }

  disputeMatchResult(matchId: string): Observable<ApiResponse<IMatch>> {
    return this.request<IMatch>('POST', matchUrls.disputeResult, {body: {id: matchId}});
  }

  private invitationTypeToUrl(invitationType: InvitationType): string {
    switch (invitationType) {
      case InvitationType.ADD_TEAM_TOURNAMENT:
        return 'addTeam/';
      case InvitationType.ADD_USER_TOURNAMENT:
        return 'addUser/';
      case InvitationType.JOIN_TEAM:
        return 'joinTeam/';
      default:
        return 'invalid/';
    }
  }

  getParticipantStatFromUser(userId: string): Observable<ApiResponse<ParticipantStat[]>> {
    return this.request<ParticipantStat[]>('GET', participantStatUrls.getParticipantStatByUserid(userId));
  }

  getParticipantStatFromTeam(teamId: string): Observable<ApiResponse<ParticipantStat[]>> {
    return this.request<ParticipantStat[]>('GET', participantStatUrls.getParticipantStatByTeamid(teamId));
  }

  updateFcmToken(token: string): Observable<ApiResponse<boolean>> {
    return this.request<boolean>('POST', userUrls.updateFcmToken, {body: {token: token}});
  }
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
}

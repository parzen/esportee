import {IStageConfig} from "./IStageConfig";
import {Venue} from "../interfaces/IReturnObjects";

export interface ITournamentConfig {
    id: number;
    stageConfigs: IStageConfig[];
    name: string;
    status: string;
    userId: number;
    gameId: number;
    gameSettings: {};
    isATeamTournament: boolean;
    venues: Venue[];
    address: {};
    type: string;
    startDate: Date;
    checkinDateStart: Date;
    checkinDateEnd: Date;
}
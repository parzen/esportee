import {Get, JsonController, Param} from "routing-controllers";
import {AppInstance} from "../../app";
import {Game} from "../../models/Game";
import {InternalServerError} from "./entities/responses/InternalServerError";
import {SuccessResponse} from "./entities/responses/SuccessResponse";
@JsonController()
export class GamesController {

    @Get("/games")
    getAll() {
        return new Promise((resolve, reject) => {
            AppInstance.entityManager.find(Game).then(
                games => resolve(new SuccessResponse(games))
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

    @Get("/games/:urlParam")
    get(@Param("urlParam") urlParam: string) {
        return new Promise((resolve, reject) => {
            AppInstance.entityManager.findOne(Game, {urlParam: urlParam}).then(
                game => {
                    resolve(new SuccessResponse(game));
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

    @Get("/game/:id")
    getGameById(@Param("id") id: number) {
        return new Promise((resolve, reject) => {
            AppInstance.entityManager.findOne(Game, {id: id}).then(
                game => {
                    resolve(new SuccessResponse(game));
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
}
import {Get, JsonController, Param, UseBefore} from "routing-controllers";
import {AppInstance} from "../../app";
import {AuthorizationMiddleware} from "./utils/AuthorizationMiddleware";
import {InternalServerError} from "./entities/responses/InternalServerError";
import {SuccessResponse} from "./entities/responses/SuccessResponse";
import {MatchToken} from "../../models/MatchToken";
import {ApiResponseFilter} from "./utils/ApiResponseFilter";

@JsonController()
export class MatchTokenController {
    @Get("/matchtokens/:tokens")
    @UseBefore(AuthorizationMiddleware)
    get(@Param("tokens") tokens: string[]) {
        return new Promise((resolve, reject) => {
            AppInstance.connection.getRepository(MatchToken).createQueryBuilder("token")
                .andWhereInIds(tokens)
                .getMany()
                .then(ApiResponseFilter.filter)
                .then(tokens => resolve(new SuccessResponse(tokens))).catch(
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
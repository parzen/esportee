import {Action, Interceptor, InterceptorInterface} from "routing-controllers";
import {ApiResponse} from "../entities/responses/ApiResponse";

@Interceptor()
export class ResponseStatusCodeInterceptor implements InterceptorInterface {
    intercept(action: Action, result: any): any | Promise<any> {
        if (result instanceof ApiResponse) {
            action.response.status(result.statusCode);
            action.response.statusMessage = result.statusMessage;
            delete result.statusCode;
            delete result.statusMessage;
        }
        return result;
    }
}

import {AuthorizationHelper} from "./AuthorizationHelper";

export class AuthorizationMiddleware {

    use(request: any, response: any, next?: (err?: any) => any): any {
        if (request.headers.authorization) {
            let header = request.headers.authorization;
            if (header.indexOf("Bearer ") !== -1) {
                let token = header.replace("Bearer ", "");
                AuthorizationHelper.validateJWTToken(token)
                    .then(function (data) {
                        request.authenticatedUser = data;
                        next();
                    })
                    .catch(function (error) {
                        response.status(401).send("token invalid");
                    });
            }
        } else {
            response.status(401).send("token missing");
        }
    }
}
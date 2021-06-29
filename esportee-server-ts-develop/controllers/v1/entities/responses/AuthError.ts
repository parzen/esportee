import {ApiError} from "./ApiError";
export class AuthError extends ApiError {
    constructor(error?: any) {
        super(401, "Authentication failed", error);
    }
}
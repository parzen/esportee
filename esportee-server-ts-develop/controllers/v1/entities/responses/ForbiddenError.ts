import {ApiError} from "./ApiError";
export class ForbiddenError extends ApiError {
    constructor(error?: any) {
        super(403, "Forbidden", error);
    }
}
import {ApiError} from "./ApiError";
export class InternalServerError extends ApiError {
    constructor(error?: any) {
        super(501, "Internal Server Error", error);
    }
}
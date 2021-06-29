import {ApiError} from "./ApiError";
export class NotFoundError extends ApiError {
    constructor(error?: any) {
        super(404, "Not Found", error);
    }
}
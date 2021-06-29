import {ApiError} from "./ApiError";
export class BadRequest extends ApiError {
    constructor(error?: any) {
        super(400, "Bad Request", error);
    }
}
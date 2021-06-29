import {ApiResponse} from "./ApiResponse";
export class ApiError extends ApiResponse {

    constructor(statusCode: number, statusMessage: string, error?: any) {
        super(false, null, statusCode, statusMessage, error);
    }
}
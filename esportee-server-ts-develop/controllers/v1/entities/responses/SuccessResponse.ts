import {ApiResponse} from "./ApiResponse";
export class SuccessResponse extends ApiResponse {
    constructor(data?: any) {
        super(true, data, 200, "OK", null);
    }
}
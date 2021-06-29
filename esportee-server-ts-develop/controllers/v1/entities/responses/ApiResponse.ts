export class ApiResponse {
    success: boolean;
    data: any;
    error: any;
    statusCode: number = 200;
    statusMessage: string;

    constructor(success: boolean, data?: any, statusCode?: number, statusMessage?: string, error?: any) {
        this.success = success;
        this.data = data;
        if (error !== null) {
            this.error = error;
        }
        if (statusCode !== null) {
            this.statusCode = statusCode;
        } else {
            this.statusCode = 200;
        }

        if (statusMessage !== null) {
            this.statusMessage = statusMessage;
        } else {
            this.statusMessage = "OK";
        }
    }

}
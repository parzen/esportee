export class Token {
    token: string;
    refreshtoken: string;

    constructor(token: string, refreshtoken?: string) {
        this.token = token;
        if (refreshtoken !== null) {
            this.refreshtoken = refreshtoken;
        }
    }
}
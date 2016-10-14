import {Injectable} from '@angular/core';

@Injectable()
export class UiErrorService {
    errorMessage:string;

    constructor() {

    }

    getErrorMessage() {
        return this.errorMessage;
    }

    setErrorMessage(msg:string) {
        this.errorMessage = msg;
    }

    reset() {
        this.errorMessage = null;
    }

    hasError():boolean {
        return this.errorMessage != null;
    }
}

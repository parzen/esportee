import {IValidationError} from "./IValidationError";
export interface ITournamentValidationError {
    errorCount: number;
    error: IValidationError;
}
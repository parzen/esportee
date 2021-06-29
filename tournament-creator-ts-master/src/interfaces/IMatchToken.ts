export interface IMatchToken {
    token: string;
    score: number;
    advantage: number;
    resultApprovedTimestamp: Date;
    user: {
        id: number,
        username: string
    },
    team: {
        id: number,
        name: string
    }
}
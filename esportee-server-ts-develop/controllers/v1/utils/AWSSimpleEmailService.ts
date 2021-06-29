import * as SES from "../../../node_modules/aws-sdk/clients/ses"
import {AppInstance} from "../../../app";
import {TournamentConfig} from "../../../models/TournamentConfig";


export class AWSSimpleEmailService {
    private sesInstance;

    constructor(config?) {
        this.sesInstance = new SES(config ? config.aws : AppInstance.config.aws)
    }

    sendConfirmationMail(recipient: string, confirmationLink: string) {
        this.sesInstance.sendEmail(<SES.Types.SendEmailRequest>{
            Source: "esportee.com <robot@esportee.com>",
            Destination: {ToAddresses: [recipient]},
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data:
                            `Thank you for your registration on esportee.com. Please verify that you are the owner of this email address by clicking <a href="${confirmationLink}">this link</a>.`
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: `Thank you for your registration on esportee.com. Please verify that you are the owner of this email address by clicking this link: ${confirmationLink}`
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'Confirm your registration'
                }
            },
            ReturnPath: 'robot@esportee.com'
        }, (error, data) => {
            console.error(error);
        })
    }

    sendCreateInvitationMail(email: string, teamname: string|null, tournament: TournamentConfig|null, acceptInviteLink: string, declineInviteLink: string) {
        let personalString = teamname == null || tournament == null ? "you" : "your team "+teamname;
        let teamOrTournament = tournament == null ? "team "+teamname : "tournament "+tournament.name;
        this.sesInstance.sendEmail(<SES.Types.SendEmailRequest>{
            Source: "esportee.com <robot@esportee.com>",
            Destination: {ToAddresses: [email]},
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data:
                            `Someone has invited ${personalString} to join the ${teamOrTournament}. You should <a href='${acceptInviteLink}'>accept the invitation</a> or <a href='${declineInviteLink}'>decline the invitation.</a>`
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: `Someone has invited ${personalString} to join the ${teamOrTournament}". Visit ${acceptInviteLink} to accept the invitation. To decline the invitation visit ${declineInviteLink}`
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: AWSSimpleEmailService.capitalizeFirstLetter(personalString) + ' are invited to the ' + teamOrTournament + '!'
                }
            },
            ReturnPath: 'robot@esportee.com'
        }, (error, data) => {
            console.error(error);
        })
    }

    sendSuccessRegisterForTournamentMail(email: string, teamname: string|null, tournament: TournamentConfig, declineInviteLink: string) {
        let personalString = teamname == null ? "you" : "your team "+teamname;
        this.sesInstance.sendEmail(<SES.Types.SendEmailRequest>{
            Source: "esportee.com <robot@esportee.com>",
            Destination: {ToAddresses: [email]},
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: AWSSimpleEmailService.capitalizeFirstLetter(personalString) + ' have successfully registered for the tournament ' + tournament.name + '. You can <a href=' + declineInviteLink + '>decline the invitation.</a> by clicking on the link.'
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: AWSSimpleEmailService.capitalizeFirstLetter(personalString) + ' have successfully registered for the tournament ' + tournament.name + '. To decline the invitation visit: ' + declineInviteLink
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: AWSSimpleEmailService.capitalizeFirstLetter(personalString) + ' registered for the tournament ' + tournament.name + '!'
                }
            },
            ReturnPath: 'robot@esportee.com'
        }, (error, data) => {
            console.error(error);
        })
    }

    sendSuccessJoinedTeamMail(email: string, teamname: string) {
        this.sesInstance.sendEmail(<SES.Types.SendEmailRequest>{
            Source: "esportee.com <robot@esportee.com>",
            Destination: {ToAddresses: [email]},
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `You have successfully joined the team ${teamname}!`
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: `You have successfully joined the team ${teamname}!`
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'You joined a team!'
                }
            },
            ReturnPath: 'robot@esportee.com'
        }, (error, data) => {
            console.error(error);
        })
    }

    static capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}
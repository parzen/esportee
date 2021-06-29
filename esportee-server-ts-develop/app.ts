import {Connection, createConnection, EntityManager, getManager} from "typeorm";
import "express";
import "reflect-metadata";
import {useExpressServer} from "routing-controllers";
import "./controllers/v1/UserController";
import "./controllers/v1/TournamentController";
import "./controllers/v1/TeamController";
import "./controllers/v1/GamesController";
import "./controllers/v1/InvitationController";
import "./controllers/v1/MatchController";
import "./controllers/v1/MatchTokenController";
import "./controllers/v1/ParticipantStatController";
import "./controllers/v1/utils/ResponseStatusCodeInterceptor";
import "./controllers/v1/utils/AuthorizationMiddleware";

import {User} from "./models/User";
import {Game} from "./models/Game";
import {ConfirmationToken} from "./models/ConfirmationToken";
import {static as staticServe} from "express";
import {Venue} from "./models/Venue";
import {MatchToken} from "./models/MatchToken";
import {Match} from "./models/Match";
import {ParticipantStat} from "./models/ParticipantStat";
import {StageConfig} from "./models/StageConfig";
import {Team} from "./models/Team";
import {Teammember} from "./models/Teammember";
import {TournamentConfig} from "./models/TournamentConfig";
import {Invitation} from "./models/Invitation";
import {AWSSimpleEmailService} from "./controllers/v1/utils/AWSSimpleEmailService";
import {WebSocketHelper} from "./utils/WebSocketHelper";
import {FirebaseMessagingHelper} from "./utils/FirebaseMessagingHelper";

require("reflect-metadata");

const express = require("express");
const cors = require("cors");
const cli = require("cli-color");
const WebSocket = require('ws');
const env = process.env.NODE_ENV;
const config = env ? require("./config.json")[env] : require("./config.json")["development"];

class App {
    public entityManager: EntityManager;
    public config = config;
    public connection: Connection;
    public mailService: AWSSimpleEmailService;
    public webSocketHelper: WebSocketHelper;
    public firebaseMessagingHelper: FirebaseMessagingHelper;

    constructor() {
        let wss = new WebSocket.Server({port: 1234});
        console.log("Websocket listening on " + cli.yellow("wss://localhost:1234"));
        this.webSocketHelper = new WebSocketHelper(wss);
        this.firebaseMessagingHelper = new FirebaseMessagingHelper(config.firebase);

        let expressApp = express();
        expressApp.use(cors());

        this.mailService = new AWSSimpleEmailService(config);

        let app = useExpressServer(expressApp, {
            validation: true,
            classTransformer: true,
            routePrefix: "/api"
        });

        app.use(staticServe('public'));

        console.log();
        console.log(cli.green("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+"));
        console.log(cli.green("-+-+-+-+-+-+-+-+-+-+-+-+-+ ") + cli.yellow("ESPORTEE SERVER") + cli.green(" +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+"));
        console.log(cli.green("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+  "));
        console.log();
        if (env === "development") {
            console.log(cli.bgRed(cli.white("-+-+-+-+-+-+-+-+-+-+-+-+   Server is in DEVELOPMENT mode   -+-+-+-+-+-+-+-+-+-+-+-")));
            console.log();
        }
        console.log("Waiting for database...");

        createConnection({
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: "postgres",
            database: "esportee-server",
            synchronize: true,
            entities: [
                ConfirmationToken,
                Game,
                Venue,
                MatchToken,
                Match,
                ParticipantStat,
                StageConfig,
                Team,
                Teammember,
                TournamentConfig,
                Invitation,
                User
            ]
        }).then(dbConnection => {
            this.entityManager = getManager();
            this.connection = <Connection>dbConnection;
            console.log("Database ready!");
            Game.seed();
        }).catch(error => console.log(error));

        app.listen(3000);
        console.log("Server listening, visit " + cli.yellow("http://localhost:3000"));
    }
}

export const AppInstance = new App();
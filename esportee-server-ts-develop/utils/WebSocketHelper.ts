import {Server} from "ws";
import {AuthorizationHelper} from "../controllers/v1/utils/AuthorizationHelper";
import WebSocket = require("ws");

export class WebSocketHelper {
    public static KEY_NOTIFICATION_UNAPPROVED_MATCH = "notification.unapprovedmatch";
    public static TOKEN_IN_URL_REGEX = /\?token=(.*)/;
    public readonly sockets = new Map<string, WebSocket[]>();

    constructor(private wss: Server) {
        let self = this;
        wss.on('connection', function (ws, req) {
            let match = WebSocketHelper.TOKEN_IN_URL_REGEX.exec(req.url);
            let token = undefined;
            if (match != null) {
                token = match[1];
            }
            if (token != null) {
                AuthorizationHelper.validateJWTToken(token)
                    .then(function (data) {
                        if (data != null) {
                            let sockets = self.sockets.get(data) || [];
                            sockets.push(ws);
                            self.sockets.set("" + data, sockets);
                            console.log("WS connections: " + self.sockets.size);
                            ws.on('message', function (msg) {
                                console.log("NEW MSG from user %s: %s", data, msg);
                            });

                            ws.on('close', function () {
                                self.sockets.delete(data);
                                let sockets = self.sockets.get(data) || [];
                                let newSockets = sockets.filter(socket => {
                                    return socket !== ws;
                                });
                                self.sockets.set("" + data, newSockets);
                            });
                        }
                    })
                    .catch(function (error) {
                        console.error(error);
                        console.error("Failed to auth [token:%s]", token);
                        ws.close();
                    });
            } else {
                console.error("Failed to auth NO TOKEN!");
                ws.close();
            }
        });
    }

    public sendMessageToUser(userId: string, msg: any) {
        let sockets = this.sockets.get(userId);
        if (sockets != null) {
            sockets.map(socket => {
                socket.send(JSON.stringify(msg));
            });
        }
    }
}
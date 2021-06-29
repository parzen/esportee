import * as firebase from "firebase";

export class FirebaseMessagingHelper {
    constructor(config: FirebaseConfig) {
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }
    }

    public sendMessage(msg: any, fcmToken) {

    }
}

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
}
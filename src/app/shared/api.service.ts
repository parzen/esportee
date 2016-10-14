import {Injectable} from '@angular/core';
import {Game} from './model/Game';

import {Http, Response} from '@angular/http';
import {Observable}     from 'rxjs/Observable';

import {LoadingService} from '../shared/loading.service';

const baseUrl = '//localhost:8000/v1';
const gameUrls = {
    list: baseUrl + '/games',
    createGameCoverImageUrl: function (shortName) {
        return baseUrl + '/images/cover/' + encodeURI(shortName);
    }
};

const userUrls = {
    create: baseUrl + '/users/create',
    getUser: baseUrl + '/users'
}

@Injectable()
export class ApiService {
    constructor(private http:Http, public loadingService:LoadingService) {
    }

    getGames():Observable<Game[]> {
        var serviceInstance = this;
        this.loadingService.setLoading(true);
        let apiService = this;
        return this.http.get(gameUrls.list)
            .map(this.extractData)
            .map(function (games:Game[]) {
                for (let game of games) {
                    game.coverImageUrl = gameUrls.createGameCoverImageUrl(game.shortName);
                }
                return games;
            }).map(function (games:Game[]) {
                apiService.stopLoading(apiService);
                return games;
            });

    }

    createProfile(uid, idToken) {
        return this.http.post(userUrls.create+ (idToken ? "?t=" + idToken : ""), JSON.stringify({userid: uid})).map(this.extractData.bind(this)).map(function (data) {
            console.log(JSON.stringify(data));
        });
    }

    getProfile(uid:string, idToken?:string):Observable<Array<{}>> {
        return this.http.get(userUrls.getUser + "/" + uid + (idToken ? "?t=" + idToken : "")).map(this.extractData).map(function (data) {
            console.log(JSON.stringify(data));
            return data;
        });
    }

    private stopLoading(apiService:ApiService) {
        apiService.loadingService.setLoading(false);
    }

    private extractData(res:Response) {
        let body = res.json();
        return body.data || [];
    }

    private handleError(error:any) {
        this.stopLoading(this);
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }

}

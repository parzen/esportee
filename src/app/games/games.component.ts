import {Component, OnInit} from '@angular/core';
import {ApiService} from '../shared/api.service';
import {Game} from '../shared/model/Game';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {LoadingService} from '../shared/loading.service';

@Component({
    selector: 'my-games',
    templateUrl: 'games.component.html',
    styleUrls: ['games.component.sass']
})
export class GamesComponent implements OnInit {

    games:Game[];
    errorMessage:string;
    loading:BehaviorSubject<boolean>;

    constructor(private api:ApiService, private loadingService:LoadingService) {
        this.loading = this.loadingService.getSubject();
    }

    ngOnInit() {
        this.getGames();
    }

    private getGames() {
        this.api.getGames()
            .subscribe(
                games => {
                    this.games = games;
                },
                error => {
                    this.errorMessage = <any>error;
                });
    }

}

import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute}       from '@angular/router';

@Component({
    selector: 'tournament-form',
    templateUrl: 'tournament-form.component.html',
    styleUrls: ['tournament-form.component.sass']
})
export class TournamentFormComponent implements OnInit {

    private gameSub:any;

    constructor(private route:ActivatedRoute,
                private router:Router) {
        this.gameSub = this.route.params.subscribe(params => {
            let gameName = params['gameName'];
            // TODO: check if game exists
        });
    }

    ngOnInit() {
        this.gameSub.unsubscribe();
    }

}

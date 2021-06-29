import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
    selector: 'my-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  private heroImageUrl: string;

    constructor() {
        // Do stuff
    }

    ngOnInit() {
        this.heroImageUrl = environment.backend + '/images/esports-hero.jpg'
    }

}

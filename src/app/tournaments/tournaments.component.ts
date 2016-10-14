import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'my-tournaments',
  templateUrl: 'tournaments.component.html',
  styleUrls: ['tournaments.component.sass']
})
export class TournamentsComponent implements OnInit {

  constructor() {
    // Do stuff
  }

  ngOnInit() {
    console.log('Hello Tournaments');
  }

}

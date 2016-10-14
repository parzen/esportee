import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'my-games-card',
  templateUrl: 'games-card.component.html',
  styleUrls: ['games-card.component.sass']
})
export class GamesCardComponent implements OnInit {
  @Input('model') model:Object;

  constructor() {
    // Do stuff
  }

  ngOnInit() {
  }

}

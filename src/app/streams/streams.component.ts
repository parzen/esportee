import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'my-streams',
  templateUrl: 'streams.component.html',
  styleUrls: ['streams.component.sass']
})
export class StreamsComponent implements OnInit {

  constructor() {
    // Do stuff
  }

  ngOnInit() {
    console.log('Hello Streams');
  }

}

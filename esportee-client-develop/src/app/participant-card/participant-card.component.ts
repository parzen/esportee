import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'participant-card',
  templateUrl: './participant-card.component.html',
  styleUrls: ['./participant-card.component.sass']
})
export class ParticipantCardComponent implements OnInit {
  @Input() participant;

  private isTeam = false;

  constructor(private router: Router) {
  }

  navigateToParticipant() {
    let path = '/user';
    if (this.isTeam) {
      path = '/team';
    }
    this.router.navigate([path, this.participant.id]);
  }

  ngOnInit() {
    this.isTeam = !this.participant.username;
  }

}

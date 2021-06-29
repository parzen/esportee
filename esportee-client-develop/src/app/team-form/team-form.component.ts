import {Component, EventEmitter, OnInit, Output, OnDestroy} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {ApiClientService} from '../shared/apiclient/api-client.service';
import {Team} from '../shared/models/team.model';
import {StringUtils} from '../shared/utils/string.util';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.sass']
})
export class TeamFormComponent extends HasSubscriptions implements OnInit, OnDestroy {
  @Output()
  newTeam: EventEmitter<Team> = new EventEmitter<Team>();

  private errors: object = {};
  teamFormControl = new FormControl('', [
    Validators.required,
    StringUtils.noWhitespaceValidator
  ]);

  constructor(private apiService: ApiClientService) {
    super();
  }

  ngOnInit() {
    this.errors['api_error'] = {};
  }

  onTeamCreate(name: string, valid: boolean) {
    if (valid) {
      this.addSubscription(this.apiService.createTeam(name)
        .subscribe((team) => {
            this.newTeam.emit(team.data);
          },
          error => {
            if (this.errors['api_error'] === undefined) {
              this.errors['api_error'] = {};
            }
            this.errors['api_error']['critical'] = 'Failed to create invitation';
          }));
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }
}

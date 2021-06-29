import {Component, EventEmitter, Input, OnChanges, OnInit, Output, OnDestroy} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {StringUtils} from '../shared/utils/string.util';
import {ApiClientService, InvitationType} from '../shared/apiclient/api-client.service';
import {InvitationCreate} from '../shared/models/invitation-create.model'
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.sass']
})
export class InvitationFormComponent extends HasSubscriptions implements OnChanges, OnInit, OnDestroy {
  private type = '';
  invitationFormControl = new FormControl('');
  private errors: object = {};

  options = [];
  filteredOptions: Observable<string[]>;
  previousToken = 'thisIsJustForSeeChanges';

  @Input()
  invitationType: InvitationType;

  @Input()
  lastInvitationTokenSaved: string;

  @Output()
  createInvitation: EventEmitter<InvitationCreate> = new EventEmitter<InvitationCreate>();

  constructor(private apiService: ApiClientService) {
    super();
    this.errors['api_error'] = {};
  }

  ngOnInit() {
    this.filteredOptions = this.invitationFormControl.valueChanges.pipe(
      startWith(''),
      map(val => this.filter(val))
    );
  }

  ngOnChanges() {
    if (this.lastInvitationTokenSaved !== this.previousToken) {
      this.invitationFormControl.setValue('');
      this.invitationFormControl.markAsPristine();
      this.invitationFormControl.markAsUntouched();
      this.invitationFormControl.markAsPending();
    }
    this.previousToken = this.lastInvitationTokenSaved;

    if (this.invitationType === InvitationType.ADD_TEAM_TOURNAMENT) {
      this.type = 'Team name';
      this.invitationFormControl.setValidators([
        Validators.required,
        StringUtils.noWhitespaceValidator]);

        this.addSubscription(this.apiService.getTeams()
        .subscribe(teams => {
          teams.data.forEach(team => {
            this.options.push(team.name)
          });
          this.filteredOptions = this.invitationFormControl.valueChanges.pipe(
            startWith(''),
            map(val => this.filter(val))
          )
        }));
    } else {
      this.type = 'Email';
      this.invitationFormControl.setValidators([
        Validators.required,
        StringUtils.emailValidator]);
    }
  }

  filter(val: string): string[] {
    return this.options.filter(option => option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  onInvitationAdd(emailOrTeamname: string, valid: boolean) {
    if (valid) {
      let result: InvitationCreate = {
        email: null,
        teamname: null
      };

      if (this.type === 'Team name') {
        result.teamname = emailOrTeamname;
      } else {
        result.email = emailOrTeamname;
      }

      this.createInvitation.emit(result);
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }
}

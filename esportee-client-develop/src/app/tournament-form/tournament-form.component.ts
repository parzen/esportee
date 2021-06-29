import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {IStageConfig, StageConfig, StageType, TournamentConfig} from 'tournament-creator-ts';
import {Game} from '../shared/models/game.model';
import {StringUtils} from '../shared/utils/string.util';
import {TournamentCreatorService} from '../shared/services/tournament-creator.service';
import {ApiClientService} from '../shared/apiclient/api-client.service';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {DialogAddGameSettingComponent} from '../dialog-add-gameSetting/dialog-add-gameSetting.component'
import {GameSetting} from '../shared/models/gameSetting.model';
import {Venue} from '../shared/models/venue.model';
import {HasSubscriptions} from '../shared/utils/HasSubscriptions';

@Component({
  selector: 'tournament-form',
  templateUrl: './tournament-form.component.html',
  styleUrls: ['./tournament-form.component.sass']
})
export class TournamentFormComponent extends HasSubscriptions implements OnInit, OnDestroy {
  private stageTypes = StageType.getValues();
  private tournamentId: string;
  private gameId: number;
  private tournament: TournamentConfig = new TournamentConfig();
  private stageConfigArray: StageConfig[] = [];
  private game: Game;
  private errors: { [s: string]: { [s: string]: string } } = {'api_error': {}};
  private submitted = false;
  private previewable = false;
  private maxDate = new Date(2100, 0, 1);
  private minDate = new Date(1900, 0, 1);
  private nrVenues = 0;
  tournamentForm: FormGroup;
  venues: FormArray;
  stageConfigs: FormArray;
  gameSettings: FormArray;

  constructor(private tournamentCreator: TournamentCreatorService,
              private router: Router,
              private route: ActivatedRoute,
              private apiService: ApiClientService,
              private fb: FormBuilder,
              public dialog: MatDialog) {
    super();
  }

  ngOnInit() {
    this.errors['api_error'] = {};

    this.tournamentForm = this.fb.group({
      name: ['', [Validators.required, StringUtils.noWhitespaceValidator]],
      nrParticipants: [16, [Validators.required, Validators.min(2)]],
      isATeamTournament: [false, Validators.required],
      venues: this.fb.array([]),
      type: ['online', [Validators.required, Validators.pattern('online|offline')]],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zip: [''],
        country: ['']
      }),
      startDate: [new Date(), Validators.required],
      checkinDateStart: [new Date()],
      checkinDateEnd: [new Date()],
      stageConfigs: this.fb.array([], Validators.required),
      gameSettings: this.fb.array([])
    }, {
      validator:
        [this.dateLessThan('checkinDateStart', 'checkinDateEnd', 'checkinStartBeforeCheckinEnd'),
          this.dateLessThan('checkinDateStart', 'startDate', 'checkInDatesBeforeStartDate'),
          this.dateLessThan('checkinDateEnd', 'startDate', 'checkInDatesBeforeStartDate')]
    });

    this.onChanges();

    this.addSubscription(this.route.params.subscribe(params => {
      this.tournamentId = params['id'];
      if (!StringUtils.isEmpty(this.tournamentId)) {
        this.addSubscription(this.apiService.getTournamentToEdit(this.tournamentId).subscribe(tournament => {
          let tournamentData = tournament.data;
          let nrParticipants = tournamentData.stageConfigs.filter(stage => stage.order == 0)[0].nrParticipants;

          this.gameId = tournamentData.gameId;

          this.tournamentForm.get('name').setValue(tournamentData.name);
          this.tournamentForm.get('nrParticipants').setValue(nrParticipants);
          this.tournamentForm.get('isATeamTournament').setValue(tournamentData.isATeamTournament);
          this.tournamentForm.get('type').setValue(tournamentData.type);
          this.tournamentForm.get('startDate').setValue(tournamentData.startDate);
          this.tournamentForm.get('checkinDateStart').setValue(tournamentData.checkinDateStart);
          this.tournamentForm.get('checkinDateEnd').setValue(tournamentData.checkinDateEnd);

          for (let i=0; i<tournamentData.stageConfigs.length; i++) {
            this.stageConfigs = this.tournamentForm.get('stageConfigs') as FormArray;
            this.stageConfigs.push(this.createStage(tournamentData.stageConfigs[i]));
          }

          if (tournamentData.type === 'offline') {
            this.tournamentForm.get('address').get('street').setValue(tournamentData.address.street);
            this.tournamentForm.get('address').get('city').setValue(tournamentData.address.city);
            this.tournamentForm.get('address').get('state').setValue(tournamentData.address.state);
            this.tournamentForm.get('address').get('zip').setValue(tournamentData.address.zip);
            this.tournamentForm.get('address').get('country').setValue(tournamentData.address.country);

            for (let i=0; i<tournamentData.venues.length; i++) {
              this.venues = this.tournamentForm.get('venues') as FormArray;
              this.venues.push(this.createVenue(tournamentData.venues[i]));
            }
          }

          this.gameSettings = this.tournamentForm.get('gameSettings') as FormArray;
          for (let i=0; i<tournamentData.gameSettings.length; i++) {
            let gameSetting: GameSetting = {setting: tournamentData.gameSettings[i].setting, value: tournamentData.gameSettings[i].value};
            this.gameSettings.push(this.createGameSetting(gameSetting));
          }
        }, error => {
          this.errors['api_error']['critical'] = 'Failed to load tournament';
        }));
      }
    }));

    this.addSubscription(this.route.params.subscribe(params => {
      let gameName = params['name'];
      if (!StringUtils.isEmpty(gameName)) {
        this.addSubscription(this.apiService.getGame(gameName).subscribe(game => {
          this.game = game.data;
          this.gameId = game.data.id;
          this.tournamentForm.get('name').setValue(this.game.title + ' Tournament');

          this.gameSettings = this.tournamentForm.get('gameSettings') as FormArray;
          for (let key in this.game.settings) {
            if (this.game.settings.hasOwnProperty(key)) {
              let gameSetting: GameSetting = {setting: key, value: this.game.settings[key]};
              this.gameSettings.push(this.createGameSetting(gameSetting));
            }
          }
        }, error => {
          if (this.errors['api_error'] === undefined) {
            this.errors['api_error'] = {};
          }
          this.errors['api_error']['critical'] = 'Unknown Game';
        }));
      }
    }));
  }

  onChanges(): void {
    this.addSubscription(this.tournamentForm.get('nrParticipants').valueChanges.subscribe(val => {
      this.updateFirstStageNrParticipants();
    }));
    this.addSubscription(this.tournamentForm.get('stageConfigs').valueChanges.subscribe(val => {
      this.invalidate();
    }));
    this.addSubscription(this.tournamentForm.get('venues').valueChanges.subscribe(val => {
      if (this.nrVenues !== this.tournamentForm.get('venues').value.length) {
        this.invalidate();
      }
    }));
    this.addSubscription(this.tournamentForm.get('type').valueChanges.subscribe(val => {
      if (val === 'offline') {
        this.tournamentForm.get('address').get('street').setValidators(Validators.required);
        this.tournamentForm.get('address').get('city').setValidators(Validators.required);
        this.tournamentForm.get('address').get('zip').setValidators([Validators.required,
          Validators.minLength(5), Validators.maxLength(10)]);
        this.tournamentForm.get('address').get('country').setValidators(Validators.required);
        this.tournamentForm.get('venues').setValidators(Validators.required);
      } else {
        this.tournamentForm.get('address').get('street').clearValidators();
        this.tournamentForm.get('address').get('city').clearValidators();
        this.tournamentForm.get('address').get('zip').clearValidators();
        this.tournamentForm.get('address').get('country').clearValidators();
        this.tournamentForm.get('venues').clearValidators();
      }
      this.tournamentForm.get('address').get('street').updateValueAndValidity();
      this.tournamentForm.get('address').get('city').updateValueAndValidity();
      this.tournamentForm.get('address').get('zip').updateValueAndValidity();
      this.tournamentForm.get('address').get('country').updateValueAndValidity();
      this.tournamentForm.get('venues').updateValueAndValidity();
    }));
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  readableStageType(type: StageType): string {
    if (type === StageType.GROUP) {
      return 'Group Phase'
    } else if (type === StageType.SWISS) {
      return 'Swiss'
    } else if (type === StageType.SINGLE_ELIMINATION) {
      return 'Single Eliminiation'
    } else if (type === StageType.DOUBLE_ELIMINATION) {
      return 'Double Eliminiation'
    } else if (type === StageType.LEAGUE) {
      return 'League'
    } else if (type === StageType.GROUP_BRACKET) {
      return 'Group Bracket'
    }
  }

  invalidate() {
    this.previewable = false;
    this.updateTotalNrParticipants();
    this.onTournamentConfigInvalidated();
    this.previewable = !this.hasErrors() && this.tournamentForm.get('stageConfigs').value.length > 0;
  }

  updateFirstStageNrParticipants(): void {
    if (this.tournamentForm.get('stageConfigs').value.length > 0) {
      if (this.tournamentForm.get('stageConfigs').value[0].nrParticipants !==
        this.tournamentForm.get('nrParticipants').value) {
        let bla = this.tournamentForm.get('stageConfigs') as FormArray;
        bla.at(0).get('nrParticipants').setValue(this.tournamentForm.get('nrParticipants').value);
      }
    }
  }

  updateTotalNrParticipants(): void {
    if (this.tournamentForm.get('stageConfigs').value.length > 0) {
      if (this.tournamentForm.get('stageConfigs').value[0].nrParticipants !==
        this.tournamentForm.get('nrParticipants').value) {
        this.tournamentForm.get('nrParticipants').setValue(this.tournamentForm.get('stageConfigs').value[0].nrParticipants);
      }
    }
  }

  onTournamentConfigInvalidated() {
    let config = new TournamentConfig();

    config.type = this.tournamentForm.get('type').value;

    this.stageConfigArray = [];
    for (let stageConfig of this.tournamentForm.get('stageConfigs').value) {
      let nsc = new StageConfig;
      nsc.name = stageConfig.name;
      nsc.stageType = stageConfig.stageType;
      nsc.nrParticipants = stageConfig.nrParticipants;
      nsc.legs = stageConfig.legs;
      nsc.nrGroups = stageConfig.nrGroups;
      nsc.thirdPlaceMatch = stageConfig.thirdPlaceMatch;
      this.stageConfigArray.push(nsc);
    }
    config.stageConfigs = this.stageConfigArray;
    config.venues = this.tournamentForm.get('venues').value;

    this.errors = TournamentConfig.validate(config);

    if (!this.hasErrors()) {
      try {
        this.tournament = this.tournamentCreator.createTournament(config);
        // console.log(JSON.stringify(this.tournament));
      } catch (e) {
        console.log(e);
        // TODO: handle invalid configs
        // this.errors["critical"] = "Config is invalid";
      }
    }
  }

  createTournamentOnServer(tournament: TournamentConfig): void {
    tournament.gameId = this.gameId;
    tournament.name = this.tournamentForm.get('name').value;
    tournament.isATeamTournament = this.tournamentForm.get('isATeamTournament').value;
    tournament.gameSettings = this.tournamentForm.get('gameSettings').value;
    tournament.type = this.tournamentForm.get('type').value;
    tournament.startDate = this.tournamentForm.get('startDate').value;
    tournament.checkinDateStart = this.tournamentForm.get('checkinDateStart').value;
    tournament.checkinDateEnd = this.tournamentForm.get('checkinDateEnd').value;
    if (tournament.type === 'offline') {
      tournament.address = this.tournamentForm.get('address').value;
      tournament.venues = this.tournamentForm.get('venues').value;
    } else {
      tournament.address = {};
      tournament.venues = [];
    }
    this.previewable = false;  // to prevent strange error

    if (!StringUtils.isEmpty(this.tournamentId)) {
      // Edit Tournament
      tournament.id = this.tournamentId;
      this.addSubscription(this.apiService.editTournament(tournament).subscribe(
        id => {
          this.router.navigate(['/tournament/' + id.data]);
        },
        error => {
          // TODO: ausführlicheres Fehlerhandling
          if (this.errors['api_error'] === undefined) {
            this.errors['api_error'] = {};
          }
          this.errors['api_error']['critical'] = 'Failed to edit tournament';
        }));
    } else {
      // Create Tournament
      this.addSubscription(this.apiService.createTournament(tournament).subscribe(
        id => {
          this.router.navigate(['/tournament/' + id.data]);
        },
        error => {
          // TODO: ausführlicheres Fehlerhandling
          if (this.errors['api_error'] === undefined) {
            this.errors['api_error'] = {};
          }
          this.errors['api_error']['critical'] = 'Failed to save tournament';
        }));
    }
  }

  hasErrors(): boolean {
    let keys = Object.keys(this.errors);
    for (let i = 0; i < keys.length; i++) {
      if (Object.keys(this.errors[keys[i]]).length !== 0) {
        return true;
      }
    }
    return false;
  }

  getErrors(id: string): string[] {
    if (!this.errors[id]) {
      return [];
    }
    let result = [];
    let keys = Object.keys(this.errors[id]);
    for (let i = 0; i < keys.length; i++) {
      if (this.errors[id][keys[i]] !== undefined) {
        result.push(this.errors[id][keys[i]]);
      }
    }
    return result;
  }

  addStage() {
    let stageConfig = new StageConfig();

    stageConfig.legs = 1;
    let nrStages = this.tournamentForm.get('stageConfigs').value.length;
    if (nrStages > 0) {
      stageConfig.nrParticipants = Math.floor(this.tournamentForm.get('stageConfigs').value[nrStages - 1].nrParticipants / 2);
      stageConfig.nrGroups = Math.floor(this.tournamentForm.get('stageConfigs').value[nrStages - 1].nrGroups / 2);
    } else {
      stageConfig.nrParticipants = this.tournamentForm.get('nrParticipants').value;
      stageConfig.nrGroups = Math.ceil(stageConfig.nrParticipants / 4);
    }
    stageConfig.nrGroups = Math.max(stageConfig.nrGroups, 1);
    stageConfig.thirdPlaceMatch = stageConfig.nrParticipants > 3 ? true : false;
    if (nrStages === 0) {
      stageConfig.name = 'Group Stage';
      stageConfig.stageType = StageType.GROUP;
    } else {
      stageConfig.name = 'Elimination Stage';
      stageConfig.stageType = StageType.SINGLE_ELIMINATION;
    }

    this.stageConfigs = this.tournamentForm.get('stageConfigs') as FormArray;
    this.stageConfigs.push(this.createStage(stageConfig));
  }

  createStage(stageConfig: StageConfig): FormGroup {
    return this.fb.group({
      name: [stageConfig.name, [Validators.required, StringUtils.noWhitespaceValidator]],
      stageType: [stageConfig.stageType, Validators.required],
      nrParticipants: [stageConfig.nrParticipants, [Validators.required, Validators.min(2)]],
      legs: [stageConfig.legs, [Validators.required, Validators.min(1)]],
      nrGroups: [stageConfig.nrGroups, [Validators.required, Validators.min(1)]],
      thirdPlaceMatch: [stageConfig.thirdPlaceMatch, Validators.required]
    });
  }

  removeStage(index: number) {
    if (index >= 0) {
      this.stageConfigs.removeAt(index);
      this.updateFirstStageNrParticipants();
    }
  }

  addVenue() {
    let venue = new Venue();

    venue.id = -1;  // TODO: if venues should be reused, use the id from user.venues
    venue.name = '';

    this.venues = this.tournamentForm.get('venues') as FormArray;
    this.venues.push(this.createVenue(venue));
    this.nrVenues = this.tournamentForm.get('venues').value.length;
  }

  createVenue(venue: Venue): FormGroup {
    return this.fb.group({
      id: [venue.id, Validators.required],
      name: [venue.name, [Validators.required, StringUtils.noWhitespaceValidator]]
    });
  }

  removeVenue(index: number) {
    if (index >= 0) {
      this.venues.removeAt(index);
      this.nrVenues = this.tournamentForm.get('venues').value.length;
    }
  }

  addGameSetting() {
    let dialogRef = this.dialog.open(DialogAddGameSettingComponent);

    this.addSubscription(dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.gameSettings = this.tournamentForm.get('gameSettings') as FormArray;
        this.gameSettings.push(this.createGameSetting(result));
      }
    }));
  }

  createGameSetting(gameSetting: GameSetting): FormGroup {
    return this.fb.group({
      setting: [gameSetting.setting, [Validators.required, StringUtils.noWhitespaceValidator]],
      value: [gameSetting.value, [Validators.required, StringUtils.noWhitespaceValidator]]
    });
  }

  removeGameSetting(index: number) {
    if (index >= 0) {
      this.gameSettings.removeAt(index);
    }
  }

  isThirdPlaceType(config: StageConfig): boolean {
    return config.stageType === StageType.DOUBLE_ELIMINATION || config.stageType === StageType.SINGLE_ELIMINATION;
  }

  dateLessThan(from: string, to: string, errorKey: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let f = group.controls[from];
      let t = group.controls[to];

      let result = {};
      result[errorKey] = true;

      return f.value <= t.value ? null : result
    }
  }
}

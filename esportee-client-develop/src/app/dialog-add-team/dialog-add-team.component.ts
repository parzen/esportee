import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Team} from '../shared/models/team.model';

@Component({
  selector: 'app-dialog-add-team',
  templateUrl: './dialog-add-team.component.html',
  styleUrls: ['./dialog-add-team.component.sass']
})
export class DialogAddTeamComponent {

  constructor(public dialogRef: MatDialogRef<DialogAddTeamComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onNewTeam(team: Team) {
    console.log(team);
    this.dialogRef.close(team);
  }
}

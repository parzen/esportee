import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'dialog-select-team',
  templateUrl: './dialog-select-team.component.html',
  styleUrls: ['./dialog-select-team.component.sass']
})
export class DialogSelectTeamComponent implements OnInit {
  teamnames: string[] = [];
  selectedTeamname: string;

  constructor(public dialogRef: MatDialogRef<DialogSelectTeamComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.teamnames = this.data.teamnames;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSelectTeam() {
    this.dialogRef.close(this.selectedTeamname);
  }
}

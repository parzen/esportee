import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {IUserInfo} from '../shared/apiclient/responses/userinfo.interface';

@Component({
  selector: 'app-dialog-edit-user',
  templateUrl: './dialog-edit-user.component.html',
  styleUrls: ['./dialog-edit-user.component.sass']
})
export class DialogEditUserComponent {
  private user: IUserInfo;

  constructor(public dialogRef: MatDialogRef<DialogEditUserComponent>,
              @Inject(MAT_DIALOG_DATA) data) {
    this.user = data.user;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onEditUser(user: IUserInfo) {
    this.dialogRef.close(user);
  }
}

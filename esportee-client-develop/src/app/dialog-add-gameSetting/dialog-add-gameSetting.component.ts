import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {GameSetting} from '../shared/models/gameSetting.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StringUtils} from '../shared/utils/string.util';

@Component({
  selector: 'dialog-add-gameSetting',
  templateUrl: './dialog-add-gameSetting.component.html',
  styleUrls: ['./dialog-add-gameSetting.component.sass']
})
export class DialogAddGameSettingComponent implements OnInit {
  formGroup: FormGroup;

  constructor(public dialogRef: MatDialogRef<DialogAddGameSettingComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      setting: ['', [Validators.required, StringUtils.noWhitespaceValidator]],
      value: ['', [Validators.required, StringUtils.noWhitespaceValidator]]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onAddGameSetting(gameSetting: GameSetting, valid: boolean) {
    if (valid) {
      this.dialogRef.close(gameSetting);
    }
  }
}

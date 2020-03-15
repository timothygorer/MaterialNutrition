import { Component, OnDestroy, Injector, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NutritionData, NutritionDataKeys, macroKeys } from 'src/app/model/items';
import { UserService } from 'src/app/services/user/user.service';
import { AppService } from 'src/app/services/app/app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogEntryComponent } from '../dialog-entry/dialog-entry.component';
import { positiveIntegersRegex } from 'src/app/consts';

type NutritionDataKeysNumberMap = {
  [key in NutritionDataKeys]?: number;
};

@Component({
  selector: 'app-goals-dialog',
  templateUrl: './goals-dialog.component.html',
  styleUrls: ['./goals-dialog.component.scss']
})
export class GoalsDialogComponent {
  public currentUserGoals: NutritionData = this.appService.deepCopy(this.userService.user.goals);
  public currentUserPercentageGoals: NutritionDataKeysNumberMap = {};
  public NutritionDataKeys = NutritionDataKeys;
  public macroKeys = macroKeys;
  public positiveIntegersRegex = positiveIntegersRegex;
  public macroCalorieMap: NutritionDataKeysNumberMap = {
    [NutritionDataKeys.FAT]: 9,
    [NutritionDataKeys.CARBS]: 4,
    [NutritionDataKeys.PROTEIN]: 4
  };

  constructor(
    public userService: UserService,
    private appService: AppService,
    private matSnackBar: MatSnackBar
  ) {
    macroKeys.forEach(macroKey => {
      this.currentUserPercentageGoals[macroKey] = Math.round(((this.userService.user.goals[macroKey]*this.macroCalorieMap[macroKey])/this.userService.user.goals[NutritionDataKeys.CALORIES])*100);
    });
  }

  public saveGoals(): void {
    this.userService.getUserFirestoreDocument().update(this.appService.convertCustomObjectToObject({
      goals: this.currentUserGoals
    })).then(() => {
      this.matSnackBar.open('Your goals were successfully saved.', 'Dismiss', {
        duration: 5000,
      })
    });
  }

  public setCurrentUserGoals(event: string, macroKey: NutritionDataKeys): void {
    const eventAsNumber = Number(event);
    this.currentUserGoals[macroKey] = Math.round((this.currentUserGoals[NutritionDataKeys.CALORIES]*eventAsNumber)/(this.macroCalorieMap[macroKey]*100));
    this.currentUserPercentageGoals[macroKey] = eventAsNumber;
  }
}

@Component({
  template: '',
})
export class GoalsDialogEntryComponent extends DialogEntryComponent {
  constructor(
    protected injector: Injector
  ) {
    super(injector, [GoalsDialogComponent, {
      width: '275px',
    }], [['../']]);
  }
}
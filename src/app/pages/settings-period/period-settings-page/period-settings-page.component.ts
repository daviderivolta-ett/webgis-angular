/** Libraries */
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/** Components */
import { HeaderComponent, SidebarComponent, SettingsNavMenuComponent, LoadingBtnComponent } from "../../../components";

/** Component */
@Component({
  selector: 'app-period-settings-page',
  imports: [
    /** Components */
    HeaderComponent,
    SidebarComponent,
    SettingsNavMenuComponent,
    LoadingBtnComponent,
    /** Directives */
    ReactiveFormsModule
  ],
  templateUrl: './period-settings-page.component.html',
  styleUrl: './period-settings-page.component.scss'
})
export class PeriodSettingsPageComponent {
  /** UI */
  public form = new FormGroup({
    initialDate: new FormControl(this._fromDateToDatetimelocal(new Date), [Validators.required]),
    endingDate: new FormControl(this._fromDateToDatetimelocal(new Date), [Validators.required]),
    alwaysAvailable: new FormControl(false)
  });

  constructor(){}

  /** Methods */
  public onFormSubmit(): void {
    console.log(this.form.value);        
  }

  private _fromDateToDatetimelocal(date: Date): string {
    const newDate: Date = date;
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
    return newDate.toISOString().slice(0, 16);
  }
}

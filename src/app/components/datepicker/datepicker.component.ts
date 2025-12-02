/** Dependencies */
import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Component */
@Component({
  selector: 'app-datepicker',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss'
})
export class DatepickerComponent {
  public form = new FormGroup({ date: new FormControl() });
  public dateChanged = output<string>();

  constructor() {
    this.form.valueChanges.subscribe((changes: any) => this._onFormChange(changes));
  }

  /** Methods */
  private _onFormChange(changes: any): void {  
    this.dateChanged.emit(changes);
  }
}
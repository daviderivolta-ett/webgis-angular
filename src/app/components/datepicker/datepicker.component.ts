/** Dependencies */
import { Component, effect, input, output } from '@angular/core';
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
  public date = input<Date | undefined>();
  public form = new FormGroup({ date: new FormControl() });
  public dateChanged = output<string>();

  constructor() {
    effect(() => this._onDateChanged(this.date()));
    this.form.valueChanges.subscribe((changes: any) => this._onFormChange(changes));
  }

  /** Methods */
  private _onDateChanged(date: Date | undefined): void {
    date ? this.form.patchValue({ date: this._toDatetimeLocal(date) }, { emitEvent: false }) : this.form.reset();
  }

  private _onFormChange(changes: any): void {
    this.dateChanged.emit(changes);
  }

  private _toDatetimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
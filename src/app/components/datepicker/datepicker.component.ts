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
  public dateChanged = output<Record<string, any>>();
  public isLoading = input<boolean>(false);

  constructor() {
    effect(() => this._onDateChanged(this.date()));
    effect(() => this.isLoading() ? this.form.get('date')?.disable() : this.form.get('date')?.enable());
    this.form.valueChanges.subscribe((changes: any) => this._onFormChange(changes));
  }

  /** Methods */
  private _onDateChanged(date: Date | undefined): void {
    date ? this.form.patchValue({ date: this._toDatetimeLocal(date) }, { emitEvent: false }) : this.form.reset();
  }

  private _onFormChange(changes: any): void {
    if (!('date' in changes) || typeof changes['date'] !== 'string' || changes['date'] === '') {
      this.dateChanged.emit({ date: null });
      return;
    }

    const date = this._truncateDateToFullHour(changes['date']);

    if (this._checkDate(new Date(date))) {
      this.form.patchValue({ date }, { emitEvent: false });
      this.dateChanged.emit({ date: this._toDatetimeLocal(new Date(date)) });
    } else {
      this.form.patchValue({ date: this._toDatetimeLocal(new Date()) }, { emitEvent: false });
      this.dateChanged.emit({ date: this._toDatetimeLocal(new Date()) });
    }
  }

  /** Utils */
  private _truncateDateToFullHour(date: string): string {
    const dateObj = new Date(date);
    const day = dateObj.getFullYear() + '-' + this._pad(dateObj.getMonth() + 1) + '-' + this._pad(dateObj.getDate());

    const hour = this._pad(dateObj.getHours());
    const minutes = dateObj.getMinutes();
    const truncatedMinutes = (minutes % 5 === 0) ? minutes : minutes - (minutes % 5);

    return `${day}T${hour}:${this._pad(truncatedMinutes)}`;
  }

  private _pad(n: number): string {
    return n.toString().padStart(2, '0');
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

  public onStepBtnClick(direction: 'backward' | 'forward'): void {
    if (!this.form.get('date')?.value) this.form.patchValue({ date: this._truncateDateToFullHour(new Date().toISOString()) }, { emitEvent: false });
    const date: Date = this.form.get('date')?.value ? new Date(this.form.get('date')?.value) : new Date();
    if (isNaN(date.getTime())) return;

    const newDate: Date = this._calculateNewDate(date, direction);

    if (this._checkDate(newDate)) {
      this.form.patchValue({ date: this._toDatetimeLocal(newDate) }, { emitEvent: false });
      this.dateChanged.emit({ date: this._toDatetimeLocal(newDate) });
    }
  }

  private _calculateNewDate(date: Date, direction: 'backward' | 'forward'): Date {
    const minutes: number = date.getMinutes();
    const newDate: Date = date;
    const newMinutes = (direction === 'backward') ? (minutes - 5) : (minutes + 5);
    newDate.setMinutes(newMinutes);
    return newDate;
  }

  private _checkDate(date: Date): boolean {
    return date <= new Date();
  }
}
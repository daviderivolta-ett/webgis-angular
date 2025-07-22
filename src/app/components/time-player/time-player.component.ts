/** Libraries */
import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/** Types */
type TimePlayerOption = {
  isPlaying: boolean,
  date?: Date
}

/** Component */
@Component({
  selector: 'app-time-player',
  imports: [
    /** Directives */
    ReactiveFormsModule
  ],
  templateUrl: './time-player.component.html',
  styleUrl: './time-player.component.scss'
})
export class TimePlayerComponent {
  /** Properties */
  /** UI */
  public form: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required])
  }, {
    updateOn: 'blur'
  });
  public isPlaying: boolean = false;

  /** Output */
  public onToggle = output<TimePlayerOption>();

  constructor() {
    this.form.valueChanges.subscribe((changes) => this._onFormChange(changes));
  }

  /** Methods */
  public patchValue(value: Date): void {
    this.form.patchValue({ date: this._toDatetimeLocal(value) });
  }

  public setIsPlaying(value: boolean): void {
    this.isPlaying = value;
    this.onToggle.emit({ isPlaying: value });
  }

  private _onFormChange(changes: any): void {
    if (!('date' in changes) || typeof changes['date'] !== 'string' || changes['date'] === '') {
      this.setIsPlaying(false);
      return;
    }

    const date = this._truncateDateToFullHour(changes['date']);
    this.form.patchValue({ date }, { emitEvent: false });
    this.isPlaying = false;
    this.onToggle.emit({ isPlaying: false, date: new Date(date) });
  }

  private _truncateDateToFullHour(date: string): string {
    const splittedDate: string[] = date.split('T');
    const day: string = splittedDate[0];
    const hourAndMinutes: string = splittedDate[1];
    const hour: string = hourAndMinutes.split(':')[0];
    return `${day}T${hour}:00`;
  }

  public onToggleBtnClick(isPlaying: boolean): void {
    this.isPlaying = isPlaying;
    const date: Date = new Date(this.form.get('date')?.value);

    this.onToggle.emit({
      isPlaying,
      date: !isNaN(date.getTime()) ? date : undefined
    });
  }

  public onStepBtnClick(direction: 'backward' | 'forward'): void {
    const date: Date = new Date(this.form.get('date')?.value);
    if (isNaN(date.getTime())) return;

    const newDate: Date = this._calculateNewDate(date, direction);

    this.form.patchValue({ date: this._toDatetimeLocal(newDate) }, { emitEvent: false });
    this.onToggle.emit({
      isPlaying: this.isPlaying,
      date: newDate
    });
  }

  private _calculateNewDate(date: Date, direction: 'backward' | 'forward'): Date {
    const hour: number = date.getHours();
    const newDate: Date = date;
    const newHour = (direction === 'backward') ? (hour - 1) : (hour + 1);
    newDate.setHours(newHour);
    return newDate;
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
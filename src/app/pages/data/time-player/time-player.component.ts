/** Libraries */
import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
    date: new FormControl(this._truncateDateToFullHour(this._toDatetimeLocal(new Date())), [Validators.required])
  }, {
    updateOn: 'blur'
  });
  private _isPlaying: boolean = false;
  private _intervalId: number | undefined;
  public isLoading = input<boolean>(false);

  /** Output */
  public onToggle = output<Date | undefined>();

  constructor() {
    this.form.valueChanges.subscribe((changes) => this._onFormChange(changes));
    effect(() => this._onIsLoadingChange(this.isLoading()));
  }

  /** Getter and setter */
  public get isPlaying() { return this._isPlaying }
  private set isPlaying(value: boolean) {
    this._isPlaying = value;
  }

  public setIsPlaying(value: boolean): void {
    this.isPlaying = value;
    value ? this._play() : this._stop();
  }

  /** Methods */
  /** Form */
  public patchValue(value: Date): void {
    this.form.patchValue({ date: this._toDatetimeLocal(value) }, { emitEvent: false });
  }

  private _onFormChange(changes: any): void {
    this.setIsPlaying(false);

    if (!('date' in changes) || typeof changes['date'] !== 'string' || changes['date'] === '') {
      this.onToggle.emit(undefined);
      return;
    }

    const date = this._truncateDateToFullHour(changes['date']);
    this.form.patchValue({ date }, { emitEvent: false });
    this.onToggle.emit(new Date(date));
  }

  /** Actions */
  public onToggleBtnClick(isPlaying: boolean): void {
    this.setIsPlaying(isPlaying);
    const date: Date = new Date(this.form.get('date')?.value);
    this.onToggle.emit(!isNaN(date.getTime()) ? date : undefined)
  }

  public onStepBtnClick(direction: 'backward' | 'forward'): void {
    this.setIsPlaying(false);

    const date: Date = new Date(this.form.get('date')?.value);
    if (isNaN(date.getTime())) return;

    const newDate: Date = this._calculateNewDate(date, direction);

    this.form.patchValue({ date: this._toDatetimeLocal(newDate) }, { emitEvent: false });
    this.onToggle.emit(newDate);
  }

  private _play() {
    const date: Date = new Date(this.form.get('date')?.value);
    if (isNaN(date.getTime())) return;

    this._intervalId = window.setInterval(() => {
      const newDate: Date = this._calculateNewDate(date, 'forward')
      this.patchValue(newDate);
      this.onToggle.emit(newDate);
    }, 1000);
  }

  private _stop() {
    if (this._intervalId) window.clearInterval(this._intervalId);
  }

  private _onIsLoadingChange(isLoading: boolean): void {
    if (isLoading) this._stop();
    if (!isLoading && this.isPlaying) this._play();
  }

  /** Utils */
  private _truncateDateToFullHour(date: string): string {
    const splittedDate: string[] = date.split('T');
    const day: string = splittedDate[0];
    const hourAndMinutes: string = splittedDate[1];
    const hour: string = hourAndMinutes.split(':')[0];
    const minutes: string = hourAndMinutes.split(':')[1];
    const num: number = parseInt(minutes);
    const newMinutes: number = (num % 5 === 0) ? num : num - (num % 5);
    const newMinutesStr: string = newMinutes.toString().padStart(2, '0');
    return `${day}T${hour}:${newMinutesStr}`;
  }

  private _calculateNewDate(date: Date, direction: 'backward' | 'forward'): Date {
    const minutes: number = date.getMinutes();
    const newDate: Date = date;
    const newMinutes = (direction === 'backward') ? (minutes - 5) : (minutes + 5);
    newDate.setMinutes(newMinutes);
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
/* Dependencies */
import { Component, computed, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* Component */
@Component({
  selector: 'app-time-player',
  imports: [ReactiveFormsModule],
  templateUrl: './time-player.component.html',

  styleUrl: './time-player.component.scss',
})
export class TimePlayerComponent {
  /* Properties */
  /* Date */
  public date = input<Date>();
  public referenceDate = input<Date>();
  public timeRange = input<number>(30);
  public min = computed(() => {
    let date = this.referenceDate();
    if (!date) date = new Date();
    const minDate = new Date(date);
    minDate.setMinutes(minDate.getMinutes() - this.timeRange());
    return this._toDatetimeLocal(minDate);
  });
  public max = computed(() => {
    let date = this.referenceDate();
    if (!date) date = new Date();
    return this._toDatetimeLocal(date);
  });

  /* UI */
  public form: FormGroup = new FormGroup(
    { date: new FormControl('', [Validators.required]) },
    { updateOn: 'blur' },
  );
  private _isPlaying: boolean = false;
  private _intervalId: number | undefined;
  public isLoading = input<boolean>(false);

  /* Output */
  public toggled = output<Date | undefined>();

  constructor() {
    this.form.valueChanges.subscribe((changes) => this._onFormChange(changes));
    effect(() => this._onIsLoadingChange(this.isLoading()));
    effect(() => {
      const date = this.date();
      if (date) this.patchValue(date, false);
    });
  }

  /* Getter and setter */
  public get isPlaying() {
    return this._isPlaying;
  }
  private set isPlaying(value: boolean) {
    this._isPlaying = value;
  }

  public setIsPlaying(value: boolean): void {
    this.isPlaying = value;
    if (value) this._play();
    else this._stop();
  }

  /* Methods */
  /* Form */
  public patchValue(value: Date, emitEvent: boolean = false): void {
    this.form.patchValue({ date: this._toDatetimeLocal(value) }, { emitEvent });
  }

  private _onFormChange(changes: any): void {
    this.setIsPlaying(false);

    if (!('date' in changes) || typeof changes['date'] !== 'string' || changes['date'] === '') {
      this.toggled.emit(undefined);
      return;
    }

    const date = this._truncateDateToFullHour(changes['date']);
    if (this._checkDate(new Date(date))) {
      this.form.patchValue({ date }, { emitEvent: false });
      this.toggled.emit(new Date(date));
    } else {
      this.patchValue(new Date());
      this.toggled.emit(new Date());
    }
  }

  /* Actions */
  public toggledBtnClick(isPlaying: boolean): void {
    if (!this.form.get('date')?.value)
      this.form.patchValue(
        { date: this._truncateDateToFullHour(new Date().toISOString()) },
        { emitEvent: false },
      );
    this.setIsPlaying(isPlaying);
    const date: Date = this.form.get('date')?.value
      ? new Date(this.form.get('date')?.value)
      : new Date();
    this.toggled.emit(!isNaN(date.getTime()) ? date : undefined);
  }

  public onStepBtnClick(direction: 'backward' | 'forward'): void {
    this.setIsPlaying(false);
    if (!this.form.get('date')?.value)
      this.form.patchValue(
        { date: this._truncateDateToFullHour(this.max() ?? new Date().toISOString()) },
        { emitEvent: false },
      );

    const date: Date = this.form.get('date')?.value
      ? new Date(this.form.get('date')?.value)
      : new Date(this.max());
    if (isNaN(date.getTime())) return;

    const newDate: Date = this._calculateNewDate(date, direction);

    if (this._checkDate(newDate)) {
      this.form.patchValue({ date: this._toDatetimeLocal(newDate) }, { emitEvent: false });
      this.toggled.emit(newDate);
    }
  }

  public onResetBtnClick(): void {
    this.form.patchValue({ date: '' }, { emitEvent: false });
    this.setIsPlaying(false);
    this.toggled.emit(undefined);
  }

  private _play() {
    const date: Date = new Date(this.form.get('date')?.value);
    if (isNaN(date.getTime())) return;

    this._intervalId = window.setInterval(() => {
      const newDate: Date = this._calculateNewDate(date, 'forward');
      if (this._checkDate(newDate)) {
        this.patchValue(newDate);
        this.toggled.emit(newDate);
      } else {
        this.setIsPlaying(false);
      }
    }, 1000);
  }

  private _stop() {
    if (this._intervalId) window.clearInterval(this._intervalId);
  }

  private _onIsLoadingChange(isLoading: boolean): void {
    if (isLoading) this._stop();
    if (!isLoading && this.isPlaying) this._play();
  }

  /* Utils */
  private _truncateDateToFullHour(date: string): string {
    const dateObj = new Date(date);
    const day =
      dateObj.getFullYear() +
      '-' +
      this._pad(dateObj.getMonth() + 1) +
      '-' +
      this._pad(dateObj.getDate());

    const hour = this._pad(dateObj.getHours());
    const minutes = dateObj.getMinutes();
    const truncatedMinutes = minutes % 5 === 0 ? minutes : minutes - (minutes % 5);

    return `${day}T${hour}:${this._pad(truncatedMinutes)}`;
  }

  private _pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  private _calculateNewDate(date: Date, direction: 'backward' | 'forward'): Date {
    const minutes: number = date.getMinutes();
    const newDate: Date = date;
    const newMinutes = direction === 'backward' ? minutes - 5 : minutes + 5;
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

  private _checkDate(date: Date): boolean {
    return date <= new Date(this.max()) && date >= new Date(this.min());
  }

  private _clampDate(date: Date): Date {
    const min = new Date(this.min());
    const max = new Date(this.max());

    if (date < min) return min;
    if (date > max) return max;

    return date;
  }
}

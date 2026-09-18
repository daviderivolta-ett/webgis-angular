/* Dependencies */
import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';

/* Component */
@Component({
  selector: 'app-datepicker',
  imports: [ReactiveFormsModule],
  templateUrl: './datepicker.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './datepicker.component.scss',
})
export class DatepickerComponent {
  public date = model<Date>();
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

  public form = new FormGroup({ date: new FormControl('', [Validators.required]) });
  public dateChanged = output<Record<string, unknown>>();
  public isLoading = input<boolean>(false);

  constructor() {
    effect(() => this._onDateChanged(this.date()));
    effect(() =>
      this.isLoading() ? this.form.get('date')?.disable() : this.form.get('date')?.enable(),
    );
    this.form.valueChanges
      .pipe(distinctUntilChanged((a, b) => a.date === b.date))
      .subscribe((changes) => this._onFormChange(changes));
  }

  /* Methods */
  private _onDateChanged(date: Date | undefined): void {
    const current = this.form.get('date')?.value;
    const formatted = date ? this._toDatetimeLocal(date) : null;

    if (current === formatted) return;

    if (date) this.form.patchValue({ date: this._toDatetimeLocal(date) }, { emitEvent: false });
    else this.form.reset({}, { emitEvent: false });
  }

  private _onFormChange(changes: Partial<{ date: string | null }>): void {
    if (this.form.get('date')?.pristine) return;

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
    // const parsed = new Date(this._truncateDateToFullHour(changes['date']));
    // const clamped = this._clampDate(parsed);

    // this.form.patchValue(
    //   { date: this._toDatetimeLocal(clamped) },
    //   { emitEvent: false }
    // );

    // this.dateChanged.emit({
    //   date: this._toDatetimeLocal(clamped)
    // });
  }

  public onResetBtnClick(): void {
    this.form.patchValue({ date: '' }, { emitEvent: false });
    this.dateChanged.emit({ date: undefined });
  }

  /** Utils */
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
    if (!this.form.get('date')?.value)
      this.form.patchValue(
        { date: this._truncateDateToFullHour(this.max() ?? new Date().toISOString()) },
        { emitEvent: false },
      );

    const date: Date = this.form.get('date')?.value
      ? new Date(this._truncateDateToFullHour(this.form.get('date')?.value ?? ''))
      : new Date(this.max());
    if (isNaN(date.getTime())) return;

    const newDate: Date = this._calculateNewDate(date, direction);

    if (this._checkDate(newDate)) {
      this.form.patchValue({ date: this._toDatetimeLocal(newDate) }, { emitEvent: false });
      this.dateChanged.emit({ date: this._toDatetimeLocal(newDate) });
    }

    // const clamped = this._clampDate(newDate);

    // this.form.patchValue(
    //   { date: this._toDatetimeLocal(clamped) },
    //   { emitEvent: false }
    // );

    // this.dateChanged.emit({
    //   date: this._toDatetimeLocal(clamped)
    // });
  }

  private _calculateNewDate(date: Date, direction: 'backward' | 'forward'): Date {
    const minutes: number = date.getMinutes();
    const newDate: Date = new Date(date);
    const newMinutes = direction === 'backward' ? minutes - 5 : minutes + 5;
    newDate.setMinutes(newMinutes);
    return newDate;
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

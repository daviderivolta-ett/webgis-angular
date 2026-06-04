/* Dependencies */
import { Component, computed, effect, ElementRef, input, output, signal, ViewChild } from '@angular/core'

/* Component */
@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent {
  /* State */
  readonly #now = new Date();
  public internalDate = signal<Date | null>(null);
  #internalReference = signal<Date>(this.#now);

  /* Inputs */
  public date = input<Date>();
  public referenceDate = input<Date>();
  public step = input<number>(300);
  public timeRange = input<number>(60 * 24 * 30);
  public isDisabled = input<boolean>(false);

  /* Ouputs */
  public dateChanged = output<Date | undefined>();

  /* Computed */
  public value = computed(() => {
    const d = this.internalDate();
    return d ? this.#toDatetimeLocal(d) : '';
  });

  public min = computed(() => {
    const ref = this.#internalReference();
    const d = new Date(ref.getTime() - this.timeRange() * 60 * 1000);
    return this.#toDatetimeLocal(d);
  });

  public max = computed(() =>
    this.#toDatetimeLocal(this.#internalReference())
  );

  /* References */
  @ViewChild('input') inputRef!: ElementRef<HTMLInputElement>;

  /* Constructor */
  constructor() {
    effect(() => {
      const d = this.date();
      if (d) this.internalDate.set(this.#clampDate(d));
    });

    effect(() => {
      const r = this.referenceDate();
      if (r) {
        this.internalDate.set(this.#clampDate(r));
        this.#internalReference.set(r);
      }
    });
  }

  /* Methods */
  public onInput() {
    const el = this.inputRef.nativeElement;
    const v = el.value;
    const d = this.#truncateDate(new Date(v));

    const clamped = this.#clampDate(d);

    this.internalDate.set(clamped);
    this.dateChanged.emit(clamped);

    queueMicrotask(() => el.value = this.value());
  }

  public onBackClick(): void {
    const date = new Date(this.internalDate() ?? this.#now);
    date.setSeconds(date.getSeconds() - this.step());
    const clamped = this.#clampDate(this.#truncateDate(date));
    this.internalDate.set(clamped);
    this.dateChanged.emit(clamped);
  }

  public onForwardClick(): void {
    const date = new Date(this.internalDate() ?? this.#now);
    date.setSeconds(date.getSeconds() + this.step());
    const clamped = this.#clampDate(this.#truncateDate(date));
    this.internalDate.set(clamped);
    this.dateChanged.emit(clamped);
  }

  public onResetClick(): void {
    this.internalDate.set(null);
    this.dateChanged.emit(undefined);
  }

  /* Lib */
  #toDatetimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  #truncateDate(date: Date): Date {
    const d = new Date(date);
    const minutes = d.getMinutes();
    const newMinutes = minutes % 5 === 0 ? minutes : minutes - (minutes % 5);
    d.setMinutes(newMinutes);
    return d;
  }

  #clampDate(date: Date): Date {
    const min = new Date(this.min());
    const max = new Date(this.max());

    if (date < min) return min;
    if (date > max) return max;

    return date;
  }
}
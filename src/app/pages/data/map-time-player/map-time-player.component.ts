/* Dependencies */
import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild
} from '@angular/core';

/* Component */
@Component({
  selector: 'app-map-time-player',
  imports: [],
  templateUrl: './map-time-player.component.html',

  styleUrl: './map-time-player.component.scss',
})
export class MapTimePlayerComponent {
  /* State */
  readonly #now = new Date();
  public internalDate = signal<Date | null>(null);
  #internalReference = signal<Date>(this.#now);
  public isPlaying = signal<boolean>(false);
  #intervalId = signal<number | undefined>(undefined);

  /* Inputs */
  public date = input<Date>();
  public referenceDate = input<Date>();
  public step = input<number>(300);
  public timeRange = input<number>(60 * 24 * 30);
  public isDisabled = input<boolean>(false);

  /* Outputs */
  public dateChanged = output<Date | undefined>();

  /* Computed */
  #minDate = computed(() => {
    const ref = this.#internalReference();
    return new Date(ref.getTime() - this.timeRange() * 60 * 1000);
  });

  #maxDate = computed(() => {
    return this.#internalReference();
  });

  public value = computed(() => {
    const d = this.internalDate();
    return d ? this.#toDatetimeLocal(d) : '';
  });

  public min = computed(() => {
    const ref = this.#internalReference();
    const d = new Date(ref.getTime() - this.timeRange() * 60 * 1000);
    return this.#toDatetimeLocal(d);
  });

  public max = computed(() => this.#toDatetimeLocal(this.#internalReference()));

  /* References */
  @ViewChild('input') inputRef!: ElementRef<HTMLInputElement>;
  readonly #destroyRef = inject(DestroyRef);

  /* Constructor */
  constructor() {
    this.#destroyRef.onDestroy(() => this.#stop());

    effect(() => {
      const d = this.date();
      if (d) this.internalDate.set(this.#clampDate(d));
    });

    effect(() => {
      const r = this.referenceDate();
      if (r) {
        const date = new Date(r);
        date.setSeconds(0, 0);
        this.internalDate.set(date);
        this.#internalReference.set(date);
      }
    });

    effect(() => {
      const isDisabled = this.isDisabled();
      const isPlaying = this.isPlaying();

      if (isDisabled || !isPlaying) this.#stop();
      else this.#play();
    });
  }

  /* Methods */
  public onInput() {
    this.isPlaying.set(false);

    const el = this.inputRef.nativeElement;
    const v = el.value;
    const d = this.#truncateDate(new Date(v));

    const clamped = this.#clampDate(d);

    this.internalDate.set(clamped);
    this.dateChanged.emit(clamped);

    queueMicrotask(() => (el.value = this.value()));
  }

  public onToggleClick(): void {
    this.isPlaying.set(!this.isPlaying());

    if (this.isPlaying()) this.#play();
    else this.#stop();
  }

  #play(): void {
    if (this.#intervalId()) return;

    this.#intervalId.set(
      window.setInterval(() => {
        const date = new Date(this.internalDate() ?? this.#now);
        date.setSeconds(date.getSeconds() + this.step());
        const clamped = this.#clampDate(this.#truncateDate(date));
        this.internalDate.set(clamped);
        this.dateChanged.emit(clamped);
        if (clamped.getTime() === this.#internalReference().getTime()) this.isPlaying.set(false);
      }, 1000),
    );
  }

  #stop(): void {
    const intervalId = this.#intervalId();
    if (intervalId !== undefined) {
      window.clearInterval(intervalId);
      this.#intervalId.set(undefined);
    }
  }

  public onBackClick(): void {
    this.isPlaying.set(false);
    const date = new Date(this.internalDate() ?? this.#now);
    date.setSeconds(date.getSeconds() - this.step());
    const clamped = this.#clampDate(this.#truncateDate(date));
    this.internalDate.set(clamped);
    this.dateChanged.emit(clamped);
  }

  public onForwardClick(): void {
    this.isPlaying.set(false);
    const date = new Date(this.internalDate() ?? this.#now);
    date.setSeconds(date.getSeconds() + this.step());
    const clamped = this.#clampDate(this.#truncateDate(date));
    this.internalDate.set(clamped);
    this.dateChanged.emit(clamped);
  }

  public onResetClick(): void {
    this.isPlaying.set(false);
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
    d.setSeconds(0, 0);
    return d;
  }

  #clampDate(date: Date): Date {
    const min = new Date(this.#minDate());
    const max = new Date(this.#maxDate());

    if (date < min) return min;
    if (date > max) return max;

    return date;
  }
}

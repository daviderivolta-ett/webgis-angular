/* Dependencies */
import { Component, computed, input, linkedSignal, output } from '@angular/core'
import { form, FormField } from '@angular/forms/signals'

/* Component */
@Component({
  selector: 'app-plotly-datepicker',
  imports: [FormField],
  templateUrl: './plotly-datepicker.component.html',

  styleUrl: './plotly-datepicker.component.scss'
})
export class PlotlyDatepickerComponent {
  /* Inputs */
  public gap = input<number>(30);
  public endingDate = input<Date>(new Date());
  public initialDate = computed(() => this.#calcInitialDateFrom(this.endingDate()));

  /* Outputs */
  public dateChange = output<{ initialDate: string, endingDate: string }>();

  /* State */
  readonly formModel = linkedSignal({
    source: () => ({
      start: this.initialDate(),
      end: this.endingDate(),
    }),
    computation: (source) => ({
      initialDate: this.#toDatetimeLocalString(source.start),
      endingDate: this.#toDatetimeLocalString(source.end),
    }),
  });

  readonly f = form(this.formModel);

  /* Methods */
  public onFormSubmit(event: Event) {
    event.preventDefault();
    this.dateChange.emit(this.formModel());
  }

  #calcInitialDateFrom(date: Date): Date {
    const initialDate = new Date(date);
    initialDate.setDate(date.getDate() - this.gap());
    return initialDate;
  }

  #toDatetimeLocalString(date: Date): string {
    if (!date || isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
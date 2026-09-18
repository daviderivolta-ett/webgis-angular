/* Dependencies */
import { Component, computed, input, signal } from '@angular/core'

/* Component */
@Component({
  selector: 'app-plotly-datepicker',
  imports: [],
  templateUrl: './plotly-datepicker.component.html',
  styleUrl: './plotly-datepicker.component.scss',
})
export class PlotlyDatepickerComponent {
  /* Inputs */
  public gap = input<number>(30);
  public endingDate = input<Date>(new Date());
  public initialDate = computed(() => this.#calcInitialDateFrom(this.endingDate()));

  /* State */
  readonly formModel = signal({
    initialDate: '',
    endingDate: ''
  });
  
  /* Methods */
  #calcInitialDateFrom(date: Date): Date {
    const initialDate = new Date(date);
    initialDate.setDate(date.getDate() - this.gap());
    return initialDate;
  }
}
/* Dependencies */
import { Component, contentChild, effect, input, output, signal } from '@angular/core'

/* Components */
import { PlotlyDatepickerComponent } from '../plotly-datepicker/plotly-datepicker.component'
import { PlotlySelectorComponent } from '../plotly-selector/plotly-selector.component'

/* Component */
@Component({
  selector: 'app-plotly-container',
  imports: [],
  templateUrl: './plotly-container.component.html',

  styleUrl: './plotly-container.component.scss',
})
export class PlotlyContainerComponent {
  /* Inputs */
  public header = input<string>('');
  public isLoading = input<boolean>(false);
  public hideControls = input<boolean>(false);

  /* Outputs */
  public stateChange = output<{ param: string, initialDate: string, endingDate: string }>();

  /* State */
  public state = signal<{ param: string, initialDate: string, endingDate: string }>({ param: '', initialDate: '', endingDate: '' });

  /* Refs */
  readonly datepicker = contentChild(PlotlyDatepickerComponent);
  readonly chartselector = contentChild(PlotlySelectorComponent);

  /* Constructor */
  constructor() {
    effect((onCleanup) => {
      const datepicker = this.datepicker();
      if (datepicker) {
        const sub = datepicker.dateChange.subscribe(this.#onDateChanged.bind(this));
        onCleanup(() => sub.unsubscribe());
      }
    });

    effect((onCleanup) => {
      const chartselector = this.chartselector();
      if (chartselector) {
        const sub = chartselector.sensorSelect.subscribe(this.#onParamChanged.bind(this))
        onCleanup(() => sub.unsubscribe());
      }
    });
  }

  /* Methods */
  #onDateChanged(dates: { initialDate: string, endingDate: string }) {
    this.state.update((oldvalue) => ({ ...oldvalue, ...dates }));
    this.stateChange.emit(this.state());
  }

  #onParamChanged(param: string) {
    this.state.update((oldvalue) => ({ ...oldvalue, param }));
    this.stateChange.emit(this.state());
  }
}
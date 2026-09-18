/* Dependencies */
import {
  Component,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import Plotly from 'plotly.js-dist-min';

/* Types */
import { PlotlySettings } from '../../types';

/* Component */
@Component({
  selector: 'app-plotly',
  imports: [],
  templateUrl: './plotly.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './plotly.component.scss',
})
export class PlotlyComponent {
  /* State */
  #resizeObserver: ResizeObserver;

  /* Inputs */
  public id = input.required<string>();
  public settings = input.required<PlotlySettings>();

  /* Outputs */
  public csvDownloadBtnClick = output<Partial<Plotly.Data>[]>();

  /* Refs */
  public plot = viewChild.required<ElementRef<HTMLDivElement>>('plot');

  /* Effects */
  constructor() {
    this.#resizeObserver = new ResizeObserver(() => Plotly.Plots.resize(this.plot().nativeElement));

    effect(() => {
      const element = this.plot().nativeElement;
      const settings = this.settings();
      if (!element || !settings) return;
      this.#draw(element, settings);
    });
  }

  /* Component lifecycle */
  public ngAfterViewInit(): void {
    this.#resizeObserver.observe(this.plot().nativeElement);
  }

  public ngOnDestroy(): void {
    this.#resizeObserver.disconnect();
  }

  /* Methods */
  #draw(element: HTMLDivElement, settings: PlotlySettings): void {
    Plotly.newPlot(element, settings.traces, settings.layout, {
      ...settings.config,
      ...this.#getConfig(),
    });
  }

  #getConfig(): Partial<Plotly.Config> {
    return {
      modeBarButtonsToAdd: [
        {
          title: 'Scarica il grafico come file CSV',
          name: 'csv_download',
          icon: {
            width: 960,
            height: 960,
            path: 'm480 624-192-192 51-51 105 105v-342h72v342l105-105 51 51-192 192zm-216.28 144q-29.72 0-50.72-21.15t-21-50.85v-72h72v72h432v-72h72v72q0 29.7-21.16 50.85-21.16 21.15-50.88 21.15h-432.24z',
          },
          click: () => this.csvDownloadBtnClick.emit(this.settings().traces),
        },
      ],
    };
  }
}

/* Dependencies */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/* Component */
@Component({
  selector: 'app-plotly-container',
  imports: [],
  templateUrl: './plotly-container.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './plotly-container.component.scss',
})
export class PlotlyContainerComponent {
  /* Inputs */
  public header = input<string>('');
  public isLoading = input<boolean>(false);
  public hideControls = input<boolean>(false);
}

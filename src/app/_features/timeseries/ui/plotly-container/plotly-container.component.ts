/* Dependencies */
import { Component, input } from '@angular/core'

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
}
/* Dependencies */
import { Component, effect, input } from '@angular/core'
import { DatePipe } from '@angular/common'

/* Component */
@Component({
  selector: 'app-layer-legend',
  imports: [
    DatePipe
  ],
  templateUrl: './layer-legend.component.html',
  styleUrl: './layer-legend.component.scss'
})
export class LayerLegendComponent {
  /* Data */
  public label = input<string>('');
  public unit = input<string | undefined>(undefined);
  public colors = input<string[]>([]);
  public labels = input<string[]>([]);
  public imgUrl = input<string>('');
  public date = input<Date | undefined>(new Date());

  /* User Interface */
  public colorWidth: number = 0;
  public tickStep: number = 0;
  public hoveredLabel: string | null = null;
  public tooltipPosition: number = 0;

  constructor() {
    effect(() => this.colorWidth = 100 / this.colors().length);
    effect(() => this.tickStep = 100 / this.colors().length);
  }

  /* Methods */
  public onColorMouseEnter(index: number): void {
    this.hoveredLabel = this.labels()[index];
    const stepWidth: number = 100 / this.labels().length;
    this.tooltipPosition = (stepWidth * index) + (stepWidth / 2);
  }
}
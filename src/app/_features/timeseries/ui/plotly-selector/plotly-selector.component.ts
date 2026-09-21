/* Dependencies */
import { Component, effect, ElementRef, input, linkedSignal, output, signal, viewChild } from '@angular/core'
import { form, FormField, disabled } from '@angular/forms/signals'

/* Component */
@Component({
  imports: [FormField],
  selector: 'app-plotly-selector',
  styleUrl: './plotly-selector.component.scss',
  templateUrl: './plotly-selector.component.html',
})
export class PlotlySelectorComponent {
  /* Inputs */
  public id = input.required<string>();
  public isDisabled = input<boolean>(false);
  public defaultSelected = input.required<string>();
  public sensorTypes = input<{ id: string, label: string, iconUrl: string }[]>([]);

  /* Outputs */
  public sensorSelect = output<string>();

  /* State */
  readonly formModel = linkedSignal(() => ({
    selected: this.defaultSelected()
  }));

  readonly f = form(this.formModel, (path) => {
    // disabled(path.selected, () => this.isDisabled())
    disabled(path.selected, { when: () => this.isDisabled() })
  });

  public hoveredSensor = signal<string | null>(null);
  public tooltipPosition = signal<number>(0);

  /* Refs */
  readonly list = viewChild<ElementRef<HTMLDivElement>>('list');

  /* Effects */
  constructor() {
    let isFirstRun = true;

    effect((onCleanup) => {
      onCleanup(() => {
        isFirstRun = false;
      });
      const selected = this.formModel().selected;
      if (isFirstRun) return;
      this.sensorSelect.emit(selected);
    });
  }

  /* Methods */
  public onIconMouseEnter(index: number): void {
    const listEl = this.list()?.nativeElement;
    if (!listEl) return;

    const icons = Array.from(listEl.children) as HTMLElement[];
    const targetIcon = icons[index];

    if (!targetIcon) return;

    const listRect: DOMRect = listEl.getBoundingClientRect();
    const itemRect: DOMRect = targetIcon.getBoundingClientRect();

    this.tooltipPosition.set(itemRect.left - listRect.left + itemRect.width / 2);

    const sensor = this.sensorTypes()[index];
    if (sensor) {
      this.hoveredSensor.set(sensor.label);
    }
  }
}
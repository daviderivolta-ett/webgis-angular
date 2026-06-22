/** Dependencies */
import { Component, effect, ElementRef, input, model, output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Types */
interface SensorType {
  id: string,
  label: string,
  iconUrl: string
}

/** Component */
@Component({
  selector: 'app-map-chart-selector',
  imports: [
    FormsModule
  ],
  templateUrl: './map-chart-selector.component.html',
  styleUrl: './map-chart-selector.component.scss'
})
export class MapChartSelectorComponent {
  public id = input<string>('');
  public isDisabled = input<boolean>(false);
  public selectedSensorType = model<string>('');
  public sensorTypes = input<SensorType[]>([]);
  public sensorTypeSelected = output<string>();
  public hoveredSensor: string | null = null;
  public tooltipPosition: number = 0;

  @ViewChild('list') _list!: ElementRef<HTMLDivElement>;

  /** Methods */
  public onIconMouseEnter(index: number): void {
    const icons: HTMLElement[] = Array.from(this._list.nativeElement.children) as HTMLElement[];
    const listRect: DOMRect = this._list.nativeElement.getBoundingClientRect();
    const itemRect: DOMRect = icons[index].getBoundingClientRect();
    this.tooltipPosition = itemRect.left - listRect.left + itemRect.width / 2;
    this.hoveredSensor = this.sensorTypes()[index].label;
  }
}
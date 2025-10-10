/** Dependencies */
import { Component, input, model, output } from '@angular/core';
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
}
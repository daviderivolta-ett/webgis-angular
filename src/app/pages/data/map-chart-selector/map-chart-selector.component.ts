/** Dependencies */
import { Component, effect, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
    ReactiveFormsModule
  ],
  templateUrl: './map-chart-selector.component.html',
  styleUrl: './map-chart-selector.component.scss'
})
export class MapChartSelectorComponent {
  public defaultSensorType = input<string>('');
  public sensorTypes = input<SensorType[]>([]);

  public form = new FormGroup({
    selectedSensorType: new FormControl('', Validators.required)
  })

  constructor() {
    this.form.valueChanges.subscribe((change) => console.log(change));
    effect(() => this.form.patchValue({ selectedSensorType: this.defaultSensorType() }));
  }
}
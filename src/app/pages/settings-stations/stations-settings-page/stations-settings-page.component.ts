/** Libraries */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Models */
import { Sensor, StationBase } from '../../../models';

/** Components */
import { HeaderComponent, SidebarComponent, SearchbarComponent, SettingsNavMenuComponent, LoadingBtnComponent } from '../../../components';

/** Component */
@Component({
  selector: 'app-stations-settings-page',
  imports: [
    /** Libraries */
    ReactiveFormsModule,
    /** Components */
    HeaderComponent,
    SidebarComponent,
    SearchbarComponent,
    SettingsNavMenuComponent,
    LoadingBtnComponent
  ],
  templateUrl: './stations-settings-page.component.html',
  styleUrl: './stations-settings-page.component.scss'
})
export class StationsSettingsPageComponent {
  /** UI */
  public form = new FormGroup<any>({});

  public isLoading: boolean = false;

  /** Data */
  public stations: StationBase[]; // Recovered from route resolver in constructor
  public filteredStations: StationBase[] = [];

  /** Constructor */
  constructor(private route: ActivatedRoute) {
    this.stations = this.filteredStations = this.route.snapshot.data['stations'];
    this.form = this._createStationsForm(this.stations);
  }

  /** Component lifecycle */
  public async ngOnInit() {
    // console.log(this.stations);
    // fetch('/mock_data/precipitation.geojson')
    //   .then((res: Response) => res.json())
    //   .then((data: GeoJSON.FeatureCollection) => {
    //     const sensors = ['pluvio', 'termo', 'idro', 'vento', 'igro', 'elio', 'radio', 'foglie', 'press', 'batt', 'boa', 'neve'];

    //     const stations = data.features.map((f: GeoJSON.Feature) => {
    //       const properties = { ...f.properties }
    //       const ranNum: number = Math.floor(Math.random() * sensors.length) + 1;
    //       return {
    //         id: properties['shortCode'],
    //         lat: f.geometry.type === 'Point' ? f.geometry.coordinates[1] : undefined,
    //         lng: f.geometry.type === 'Point' ? f.geometry.coordinates[0] : undefined,
    //         name: properties['name'],
    //         city: properties['municipality'],
    //         alt: properties['alt'],
    //         sensors: sensors.slice(0, ranNum).map((id: string) => {
    //           const num = Math.floor(Math.random() * 100);
    //           return {
    //             id: `${properties['shortCode']}-${id}`,
    //             type: id,
    //             isVisible: num % 2 === 0 ? true : false
    //           }
    //         })
    //       }
    //     });

    //     console.log(JSON.stringify(stations));
    //     console.log(stations);
    //   })
  }

  /** Methods */
  private _createStationsForm(stations: StationBase[]): FormGroup {
    const controls = stations.reduce((acc, station) => {
      const array = new FormArray(
        station.sensors.map(sensor => new FormControl(sensor.isVisible)),
        { updateOn: 'change' }
      );
      acc[station.id] = array;
      return acc;
    }, {} as { [key: string]: FormArray<FormControl> });

    return new FormGroup(controls);
  }

  private _createStationsOnFormChanges(changes: any): Record<string, any>[] {
    return this.stations.map((station: StationBase) => {
      const stationFormData: any = changes[station.id];
      return {
        ...station,
        sensors: station.sensors.map((sensor: Sensor, index: number) => {
          return {
            ...sensor,
            isVisible: stationFormData[index] ?? false
          }
        })
      }
    });
  }

  public onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filteredStations = this.stations.filter((s: StationBase) => s.id.toLowerCase().includes(value.toLowerCase()));
  }

  public onFormSubmit(): void {
    // console.log('submit', this.form.value);
    const result = this._createStationsOnFormChanges(this.form.value);
    console.log(result);    
    this.isLoading = true;
  }
}
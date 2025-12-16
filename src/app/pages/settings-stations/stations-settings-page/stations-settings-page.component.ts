/** Libraries */
import { Component, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Models */
import { Sensor, SensorType, StationBase } from '../../../models';

/** Services */
import { ApiService, AuthService, SnackbarsService, StationsService } from '../../../services';

/** Components */
import { HeaderComponent, SidebarComponent, SearchbarComponent, SettingsNavMenuComponent, LoadingBtnComponent } from '../../../components';

/** Pipes */
import { MapValuePipe } from '../../../pipes';

/** Utils */
import { Utils } from '../../../utils';

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
    LoadingBtnComponent,
    /** Pipes */
    MapValuePipe
  ],
  templateUrl: './stations-settings-page.component.html',
  styleUrl: './stations-settings-page.component.scss'
})
export class StationsSettingsPageComponent {
  /** UI */
  public form = new FormGroup<any>({});
  public initialFormValue: Record<string, any[]> = {};
  public isLoading: boolean = false;

  /** Data */
  public user: Record<string, any> | null = null;

  public apiBaseUrl; // Recovered from route resolver in constructor
  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public stationParametersUrl; // Recovered from route resolver in constructor
  public stationParametersPatchUrl; // Recovered from route resolver in constructor
  public stations: Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>[] = [];
  public filteredStations: Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>[] = [];
  private _sensorTypes: SensorType[]; // Recovered from route resolver in constructor

  public sensorTypesMap: Map<string, string> = new Map();

  /** Constructor */
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private stationsService: StationsService,
    private snackbarsService: SnackbarsService
  ) {
    this.apiBaseUrl = this.route.snapshot.data['apisConfig'].get('baseUrl');
    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.stationParametersUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('stationParameters'));
    this.stationParametersPatchUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('stationParametersPatch'));
    this._sensorTypes = this.route.snapshot.data['sensorTypes'];

    /** Effetcs */
    effect(() => {
      this.user = this.authService.user();
    });
  }

  /** Component lifecycle */
  public async ngOnInit() {
    this.stationsService.getStationParameters(this.stationParametersUrl, this.authService.getAccessToken())
      .then((stations) => {
        this.stations = this.filteredStations = stations.sort((a, b) => a.id.localeCompare(b.id));
        this.form = this._createStationsForm(stations);
        this.initialFormValue = { ...this.form.value };
      })

    this.sensorTypesMap = new Map(this._sensorTypes.map((t: SensorType) => [t.id, t.label]));
  }

  /** Methods */
  /** Init */
  private _createStationsForm(stations: Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>[]): FormGroup {
    const controls = stations.reduce((acc, station) => {
      const array = new FormArray(
        station.sensors.map(sensor => new FormControl(sensor.enabled)),
        { updateOn: 'change' }
      );
      acc[station.id] = array;
      return acc;
    }, {} as { [key: string]: FormArray<FormControl> });

    return new FormGroup(controls);
  }

  private _createStationsOnFormChanges(changes: any): Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>[] {
    return this.stations
      .filter(station => changes[station.id] !== undefined)
      .map(station => {
        const stationFormData: boolean[] = changes[station.id];
        return {
          ...station,
          sensors: station.sensors.map((sensor: Sensor, index: number) => {
            return {
              ...sensor,
              enabled: stationFormData[index] ?? false
            }
          })
        }
      })
  }

  public onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filteredStations = this.stations.filter((s) => s.id.toLowerCase().includes(value.toLowerCase()));
  }

  public async onFormSubmit(): Promise<void> {
    const changes: Record<string, any[]> = Utils.diffRecordArrays(this.form.value, this.initialFormValue);
    const result = this._createStationsOnFormChanges(changes);
    const post = result.map((v) => StationBase.fromPartialToDatabaseStationParameter(v));

    this.isLoading = true;
    this.stationsService.patchStationParameters(this.stationParametersPatchUrl, post, this.authService.getAccessToken())
      .then(() => {
        this.snackbarsService.createSnackbar('Stato della stazione aggiornato con successo.', 'success', true)
      })
      .catch((error: unknown) => {
        this.snackbarsService.createSnackbar(error instanceof Error ? error.message : 'Errore nel recupero dei parametri delle stazioni', 'error', true)
      })
      .finally(() => {
        this.isLoading = false;
        this.form.markAsPristine();
      })
  }
}
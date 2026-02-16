/** Libraries */
import { ChangeDetectorRef, Component, effect, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Models */
import { Chip, ColorScale, ColorScaleBase, Command, createDefaultStationsPopupConfig, createStationPopupConfigFromObject, GeoJsonLayer, GeojsonLegend, GroupedCheckboxItem, Layer, LayerCategory, LayerGroup, LayerGroupToCheckboxAdapter, Legend, MapChart, MapChartData, MapConfig, Sensor, SensorType, Settings, Station, StationBase, StationPopupConfig, TileLayer, User, Webcam, WMSLayer, WMSLegend } from '../../../models';

/** Services */
import { ApiService, AuthService, CommandsRegistryService, DateService, LayersService, PopupService, SnackbarsService, StationsService } from '../../../services';

/** Components */
import { ChipComponent, GroupedCheckboxesComponent, HeaderComponent, PopUpMenuComponent, SidebarComponent, SliderComponent, FloatingDialogComponent, PlotlyChartComponent } from '../../../components';
import { MapComponent } from '../map/map.component';
import { MapPopupComponent } from '../map-popup/map-popup.component';
import { LayerLegendComponent } from '../layer-legend/layer-legend.component';
import { MapChartComponent } from '../map-chart/map-chart.component';
import { MapChartSelectorComponent } from '../map-chart-selector/map-chart-selector.component';
import { MapChartDatepickerComponent } from '../map-chart-datepicker/map-chart-datepicker.component';
import { WebcamComponent } from '../webcam/webcam.component';

/** Utilities */
import { CSVUtils, DateUtils, Utils } from '../../../utils';

/** Component */
@Component({
  selector: 'app-data-page',
  imports: [
    // Components
    HeaderComponent, SidebarComponent, MapComponent, LayerLegendComponent, PopUpMenuComponent, GroupedCheckboxesComponent, ChipComponent, MapPopupComponent, SliderComponent, FloatingDialogComponent, MapChartSelectorComponent, MapChartComponent, MapChartDatepickerComponent, PlotlyChartComponent, WebcamComponent,
    // Directives
    ReactiveFormsModule,
    // Pipes
    DatePipe
  ],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent {
  /** Class properties */
  /** User Interface */
  public isLoading: boolean = false;
  public windowWidth: number;
  public isSliderCollapsed: boolean = false;

  public baseLayersForm: FormGroup = new FormGroup({ baseLayer: new FormControl() });
  public infoLayersForm: FormGroup = new FormGroup({});
  public groupedCheckboxes: GroupedCheckboxItem[]; // Recovered from route resolver in constructor
  public chips: Chip[] = [];

  public geojsonLegends: GeojsonLegend[] = [];
  public wmsLegends: WMSLegend[] = [];

  public popupData: Station[] = [];
  public charts: MapChart[] = [];
  public hydroImgs: string[] = [];
  public webcams: Webcam[] = [];
  public areChartsDisabled: boolean = false;
  public chartReferenceDate: Date | undefined;

  public initialDate: Date | undefined;
  public selectedDate: Date | undefined;
  public wmsLayersDate: Date | undefined;

  /** References */
  @ViewChild('map') _map!: MapComponent;
  @ViewChild('sidebar') _sidebar!: SidebarComponent;
  @ViewChildren('groupedCheckbox') _groupedCheckboxes!: QueryList<GroupedCheckboxesComponent>;
  @ViewChild('baseLayersMenu') _baseLayersMenu!: PopUpMenuComponent;
  @ViewChild('infoLayersMenu') _infoLayersMenu!: PopUpMenuComponent;
  @ViewChild('legendsMenu') _legendsMenu!: PopUpMenuComponent;

  /** Listeners */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowWidth = window.innerWidth;
  }

  /** Data */
  public user: User | null = null;
  public refreshLayersId: number | null = null;

  public mapConfig: MapConfig; // Recovered from route resolver in constructor
  public settings: Settings; // Recovered from route resolver in constructor

  public apiBaseUrl; // Recovered from route resolver in constructor
  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public polygonMeanApiBaseUrl; // Recovered from route resolver in constructor
  public stationsUrl; // Recovered from route resolver in constructor
  public parametersUrl; // Recovered from route resolver in constructor 
  public stationParametersUrl; // Recovered from route resolver in constructor
  public latestPopupConfigUrl; // Recovered from route resolver in constructor
  public timeserieUrl; // Recovered from route resolver in constructor
  public hydroImgsUrl; // Recovered from route resolver in constructor
  public webcamImgsUrl; // Recovered from route resolver in constructor

  public stationPopupConfig: StationPopupConfig = createStationPopupConfigFromObject({});
  public stations: StationBase[] = [];

  public baseColorScales: ColorScaleBase[]; // Recovered from route resolver in constructor
  public baseLayers: TileLayer[]; // Recovered from route resolver in constructor
  public infoLayers: WMSLayer[]; // Recovered from route resolver in constructor
  public dataLayers: LayerGroup[]; // Recovered from route resolver in constructor
  private _layerCategories: Map<string, LayerCategory>; // Recovered from route resolver in constructor
  private _sensorTypes: SensorType[]; // Recovered from route resolver in constructor

  private _currentDataLayers: Map<string, string[]> = new Map<string, string[]>();

  /** Constructor */
  constructor(
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private popupService: PopupService,
    private dateService: DateService,
    private snackbarsService: SnackbarsService,
    private layersService: LayersService,
    private stationsService: StationsService,
    private commandsRegistry: CommandsRegistryService
  ) {
    this.windowWidth = window.innerWidth;

    /** Recovering data from resolvers */
    this.mapConfig = this.route.snapshot.data['mapConfig'];
    this.settings = this.route.snapshot.data['settings'];

    this.apiBaseUrl = this.route.snapshot.data['apisConfig'].get('baseUrl');
    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.polygonMeanApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('polygonMeanApi'));

    this.stationsUrl = apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('stations'));
    this.parametersUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('parameters'));
    this.stationParametersUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('stationParameters'));
    this.latestPopupConfigUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('latestConfig'));
    this.timeserieUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('timeseries'));
    this.hydroImgsUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('hydroImgs'));
    this.webcamImgsUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('webcamImgs'));

    this.baseColorScales = this.route.snapshot.data['colorScales'];
    this.baseLayers = LayerGroup.getAllLayers(this.route.snapshot.data['baseLayers']).filter((l: Layer) => l instanceof TileLayer);
    this.infoLayers = LayerGroup.getAllLayers(this.route.snapshot.data['infoLayers']).filter((l: Layer) => l instanceof WMSLayer);
    this.dataLayers = this.route.snapshot.data['groupedCheckboxes'];
    this._layerCategories = new Map(this.route.snapshot.data['layerCategories'].map((c: LayerCategory) => [c.id, c]));
    this._sensorTypes = this.route.snapshot.data['sensorTypes'];

    this.groupedCheckboxes = this.dataLayers.map((v: LayerGroup) => LayerGroupToCheckboxAdapter.convert(v));

    /** Forms init */
    this.baseLayersForm.valueChanges.subscribe((changes: any) => this._onBaselayersRadioChange(changes));
    if (this.infoLayers.length > 0) this.infoLayers.forEach((l: WMSLayer) => this.infoLayersForm.addControl(l.id, new FormControl(false)));
    Object.keys(this.infoLayersForm.controls).forEach((controlName: string) => {
      const control = this.infoLayersForm.get(controlName);
      if (control) control.valueChanges.subscribe((changes: any) => this._onInfoLayersCheckboxesChange(controlName, changes));
    })

    /** Effetcs */
    effect(() => {
      const currentUser = this.authService.user();
      const isAuth: boolean = currentUser ? true : false;
      this._changeCheckboxesVisibility(isAuth);
      this.setDataFromApi();
      this.user = currentUser;
    });

    effect(() => {
      const date = this.dateService.date();
      this.initialDate = date;
      this.selectedDate = date;
    });
  }

  /** Getter and setter */
  public get currentDataLayers() {
    return {
      map: this._currentDataLayers,
      toArray: () => Array.from(this._currentDataLayers.values()).flat()
    }
  }

  /** Component lifecycle */
  public ngAfterViewInit(): void {
    if (this.baseLayers.length > 0) this.baseLayersForm.get('baseLayer')?.setValue(this.baseLayers[0].id);

    this.popupService.getLatestPopupConfig(this.apiService.addSearchParamsToUrl(this.latestPopupConfigUrl, { Tag: 'popupConfig' }), this.authService.getAccessToken())
      .then((config: any) => this.stationPopupConfig = config)
      .catch(() => this.stationPopupConfig = createDefaultStationsPopupConfig())

    this._applyLayersFromQueryParams(this.route.snapshot.queryParamMap);
  }

  public ngOnDestroy(): void {
    if (this.refreshLayersId) window.clearInterval(this.refreshLayersId);
  }

  /** Methods  */
  /** Init */
  public async setDataFromApi() {    
    this.isLoading = true;
    try {
      const [stationsPick, allStations, sensorTypes] = await Promise.all([
        this.stationsService.getStationParameters(this.stationParametersUrl, this.authService.getAccessToken()),
        this.stationsService.getAllStations(this.stationsUrl, this.authService.getAccessToken()),
        this.stationsService.getAllParameters(this.parametersUrl, this.authService.getAccessToken())
      ]);

      this._sensorTypes = this._sensorTypes.filter((s: SensorType) => sensorTypes.some((sensor: Sensor) => s.id === sensor.type || s.id === `${sensor.type}--cumulative`));
      this.stations = this.stationsService
        .mergeBaseStationsAndPickStations(allStations, stationsPick)
        .sort((a, b) => a.id.localeCompare(b.id));
    } catch (error) {
      this.snackbarsService.createSnackbar('Errore nel recupero dei dati', 'error', true);
    } finally {
      this.isLoading = false;
    }
  }

  private _applyLayersFromQueryParams(params: ParamMap): void {
    const layerIds: string[] = params.getAll('layer');
    const baseLayerIds: string[] = params.getAll('base');
    const infoLayerIds: string[] = params.getAll('info');

    if ([...layerIds, ...baseLayerIds, ...infoLayerIds].length === 0) {
      this._currentDataLayers.set('data_geojson-point', ['station_precipitations_1h']);
      this._updateMultipleLayers(this.dateService.date(), true);
      this.infoLayersForm.patchValue({ zone_di_allerta: true });
      return;
    }

    const layers: Layer[] = layerIds.map((id: string) => {
      return this.dataLayers.map((g: LayerGroup) => g.searchLayerById(id))
    }).flat().filter(l => l !== undefined);

    this._currentDataLayers = layers.reduce((acc: Map<string, string[]>, curr: Layer) => {
      return this.layersService.checkLayerCategories(curr, true, acc, this._layerCategories, !!this.user);
    }, new Map(this.currentDataLayers.map));

    this._updateMultipleLayers(undefined, true);

    const baseLayers: TileLayer[] = this.baseLayers.filter((l) => baseLayerIds.includes(l.id))
    if (baseLayers.length > 0) {
      this.baseLayersForm.patchValue({ baseLayer: baseLayers[0].id }, { emitEvent: false });
      this._map.removeLayerById('base');
      this._map.addBaseLayer(baseLayers[0].url, { ...baseLayers[0] });
      this._updateFirstQueryParamValue('base', baseLayers[0].id);
    }

    const infoLayers: WMSLayer[] = this.infoLayers.filter((l) => infoLayerIds.includes(l.id));
    if (infoLayers.length > 0) this.infoLayersForm.patchValue(
      infoLayers.reduce<{ [key: string]: boolean }>((acc, layer) => {
        acc[layer.id] = true;
        return acc;
      }, {})
    )
  }

  private _updateLayerQueryParams(activeLayersIds: string[]): void {
    this.router.navigate([], {
      queryParams: { layer: [...activeLayersIds] },
      queryParamsHandling: 'merge'
    })
  }

  private _updateFirstQueryParamValue(param: string, value: string): void {
    const values: string[] = this.route.snapshot.queryParamMap.getAll(param);
    const updated: string[] = [value, ...values.slice(1)];
    this.router.navigate([], {
      queryParams: { [param]: updated },
      queryParamsHandling: 'merge'
    });
  }

  private _changeLayerQueryParams(param: string, idsToAdd: string[], idsToRemove: string[]): void {
    const layers: string[] = this.route.snapshot.queryParamMap.getAll(param);
    const result: string[] = Array.from(new Set([...layers.filter((id: string) => !idsToRemove.includes(id)), ...idsToAdd]));
    this.router.navigate([], {
      queryParams: { [param]: result.length ? result : null },
      queryParamsHandling: 'merge'
    })
  }

  private _changeCheckboxesVisibility(isAuth: boolean) {
    const authLayers = LayerGroup.getAuthLayers(this.dataLayers, isAuth);
    this.groupedCheckboxes = this.groupedCheckboxes.map((group: GroupedCheckboxItem) => {
      return group.visibleNestedCheckbox(authLayers, group);
    });
  }

  /** Actions */
  public onMapClick(): void {
    this._sidebar.toggleSidebar(false);
    this._baseLayersMenu.togglePopUpMenu(false);
    this._infoLayersMenu.togglePopUpMenu(false);
    this._collapseSliderState(false);
  }

  public onSidebarToggle(isOpen: boolean): void {
    if (isOpen) {
      this._baseLayersMenu.togglePopUpMenu(false);
      this._infoLayersMenu.togglePopUpMenu(false);
      this._collapseSliderState(true);
    } else {
      this._collapseSliderState(false);
    }
  }

  public onBaseLayersMenuToggle(isOpen: boolean): void {
    if (isOpen) {
      this._sidebar.toggleSidebar(false);
      this._infoLayersMenu.togglePopUpMenu(false);
    }
  }

  public onInfoLayersMenuToggle(isOpen: boolean): void {
    if (isOpen) {
      this._sidebar.toggleSidebar(false);
      this._baseLayersMenu.togglePopUpMenu(false);
    }
  }

  private _collapseSliderState(isCollapsed: boolean): void {
    this.isSliderCollapsed = (this.windowWidth > 768) ? isCollapsed : false;
  }

  public onResetMapButtonClick(): void {
    this._map.resetMap();
  }

  public onMapLayerAdded(event: Record<string, any>): void {
    const { id } = event;
    if (!id) return;

    const foundLayer: Layer | undefined = LayerGroup.getAllLayers(this.dataLayers).find((l: Layer) => l.id === id);
    if (!foundLayer) return;


    // Chips
    let iconUrl: string = '';
    if (event['icon'] && event['icon'] instanceof SVGSVGElement) iconUrl = Utils.svgElementToImgSrc(event['icon']);
    const chip = new Chip(event['id'], foundLayer.longLabel ?? foundLayer.label ?? event['id'], iconUrl);
    this.chips.push(chip);

    // Refresh   
    if (this.refreshLayersId) window.clearInterval(this.refreshLayersId);
    if (!this.dateService.date()) {
      this.refreshLayersId = window.setInterval(() => this._refreshLayers(), 300000);
    }

    // Legends
    if (!foundLayer || !foundLayer.legend) return;
    const colorScale: ColorScale | undefined = this._generateLayerColorScale(foundLayer, this.baseColorScales);
    if (!colorScale) return;
    this.geojsonLegends.push({ layerId: foundLayer.id, layerLabel: foundLayer.longLabel ?? foundLayer.label, unit: foundLayer.legend.altUnit || foundLayer.legend.unit, colors: colorScale.colors, labels: foundLayer.legend.labels ?? colorScale.calculateTicks(), date: !foundLayer.layerType.includes('wms') ? this.dateService.date() ?? new Date() : undefined });
  }

  public onMapLayerRemoved(event: Record<string, any>): void {
    const id = event['id'];
    if (!id) return;
    this.chips = this.chips.filter((c: Chip) => c.id !== id);
    this.geojsonLegends = this.geojsonLegends.filter((l: Legend) => l.layerId !== id);
    this.wmsLegends = this.wmsLegends.filter((l: Legend) => l.layerId !== id);
    this._map.closeAllPopups();
  }

  private _refreshLayers(): void {
    const currentLayerIds: string[] = Array.from(this._currentDataLayers.values()).flat();

    if (currentLayerIds.length === 0) {
      if (this.refreshLayersId) window.clearInterval(this.refreshLayersId)
      return;
    }

    const allLayers = LayerGroup.getAllLayers(this.dataLayers);
    const currentLayers = allLayers.filter((l: Layer) => currentLayerIds.includes(l.id));
    currentLayers.forEach((l: Layer) => {
      this._map.removeLayerById(l.id);
      this._executeAction(l, this.dateService.date());
    });
  }

  public onMapMarkerClicked(data: Record<string, any>[]): void {
    const stations = data.map((d: any) => {
      if ('type' in d && typeof d['type'] === 'string') {
        switch (d['type']) {
          case 'lightning':
            d['stationCode'] = 'Fulminazione';
            d['unit'] = 'A';
            break;

          case 'hydro':
            d['value'] = 0;
            break;

          default:
            break;
        }
      }

      const stationBase = StationBase.createFromGeoJSONProps(d);
      const stationData = Station.createStationDataFromGeoJSONProps(d);
      const station = Station.fromStationData(stationBase, stationData);
      return station.addSensorsFromStationLists(this.stations);
    });
    this.popupData = [...stations];
  }

  public onMapClicked(event: Record<string, any>) {
    const { bbox, point, size, latLng } = event;

    if (!bbox || typeof bbox !== 'string') return;
    if (!('x' in point) || typeof point['x'] !== 'number' || !('y' in point) || typeof point['y'] !== 'number') return;
    if (!('width' in size) || typeof size['width'] !== 'number' || !('height' in size) || typeof size['height'] !== 'number') return;
    if (!('lat' in latLng) || typeof latLng['lat'] !== 'number' || (!('lng' in latLng) || typeof latLng['lng'] !== 'number')) return;

    const activeWMSLayers: WMSLayer[] = LayerGroup.getAllLayers(this.dataLayers)
      .filter((l: Layer) => this.currentDataLayers.toArray().includes(l.id))
      .filter((l: Layer) => l instanceof WMSLayer);

    if (activeWMSLayers.length === 0) return;

    const layer: WMSLayer = activeWMSLayers[0];
    this.layersService.getFeatureInfoWMSLayer(layer, bbox, point, size, latLng)
      .then((info: [string, number][]) => {
        info.forEach(([label, value]: [string, number]) => {
          this._map.openCustomPopup(`<p><strong>${label}:</strong> ${layer.multiplier ? Utils.truncateValueByDecimals(value * layer.multiplier, layer.decimals ?? 1) : Utils.truncateValueByDecimals(value, layer.decimals ?? 1)} ${(layer.legend && layer.legend.unit) ? layer.legend.unit : ''}</p>`, latLng);
        });
      })
      .catch((err: unknown) => {
        this.snackbarsService.createSnackbar(err instanceof Error ? err.message : `Errore nel recupero dei dati puntuali del layer`, 'error', true);
      })
  }

  public onFeatureClicked(event: Record<string, any>): void {
    const { coordinates, ...properties } = event;

    const activeGeoJSONLayers: GeoJsonLayer[] = LayerGroup.getAllLayers(this.dataLayers)
      .filter((l: Layer) => this.currentDataLayers.toArray().includes(l.id))
      .filter((l: Layer) => l instanceof GeoJsonLayer)
      .filter(l => l.layerCategory === 'data_wms');

    if (activeGeoJSONLayers.length === 0) return;

    const layer: GeoJsonLayer = activeGeoJSONLayers[0];
    this._map.openCustomPopup(`<p><strong>${layer.label}:</strong> ${(Math.round(properties['mean_value'] * 100) / 100) * (layer.multiplier ? layer.multiplier : 1)} ${layer.legend && layer.legend.unit ? layer.legend.unit : ''}</p>`, coordinates);
  }

  private _onBaselayersRadioChange(changes: any): void {
    const layer: TileLayer | undefined = this.baseLayers.find((l: TileLayer) => l.id === changes['baseLayer']);
    if (!layer) return;
    const { id, label, url, ...rest } = layer;
    this._map.addBaseLayer(url, rest);
    this._updateFirstQueryParamValue('base', id);
  }

  private _onInfoLayersCheckboxesChange(layerId: string, value: boolean): void {
    if (!value) {
      this._map.removeLayerById(layerId);
      this._changeLayerQueryParams('info', [], [layerId]);
    }
    else {
      const infoLayer: WMSLayer | undefined = this.infoLayers.find((l) => l.id === layerId);
      if (infoLayer) {
        this._map.addWMSLayer(infoLayer.id, infoLayer.url, infoLayer.params);
        this._changeLayerQueryParams('info', [layerId], []);
      }
    }
  }

  public async onMapPopupOpenChartBtnClick(stations: Station[]): Promise<void> {
    const newCharts: MapChart[] = [];
    const hydroPromises: Promise<string>[] = [];
    const webcamPromises: Promise<string>[] = [];

    stations.forEach(async (s: Station) => {
      switch (s.type) {
        case 'hydro':
          const date = this.stationsService.getHydroDateFromSubfolder(this.dateService.date() ?? new Date(), s['subfolder'] ?? '');
          const hydroSnackbarId: string = this.snackbarsService.createSnackbar(`Recupero grafici idro`, 'loader');
          const hydroPromise = this.stationsService.getHydroImageAt(this.hydroImgsUrl, s.parameter, s.id, date, this.authService.getAccessToken())
            .catch((err: unknown) => {
              this.snackbarsService.createSnackbar(err instanceof Error ? err.message : `Errore nel recupero dell'immagine dell'hydro.`, 'error', true);
              throw err;
            })
            .finally(() => this.snackbarsService.removeSnackbar(hydroSnackbarId))
          hydroPromises.push(hydroPromise);
          break;

        case 'platform':
          const station: StationBase | undefined = this.stations.find((station: StationBase) => station.id === s.id);
          const thresholds: Record<string, number> = {};
          if (station?.thresholdConfig) Object.entries(station.thresholdConfig).forEach(([k, v]: [string, number]) => {
            if (Utils.isValidColor(k) && v) thresholds[k] = v;
          });
          const foundSensor: SensorType | undefined = this._sensorTypes.find((sensor) => sensor.id === s.parameter);
          newCharts.push(this.stationsService.createChart(s, this._sensorTypes, foundSensor && foundSensor.thresholdKeys ? thresholds : {}));
          break;

        case 'webcam':
          const webcamSnackbarId: string = this.snackbarsService.createSnackbar(`Recupero immagine della webcam`, 'loader');
          const webcamPromise = this.stationsService.getWebcamImageAt(this.webcamImgsUrl, s.id, this.dateService.date() ?? new Date(), this.authService.getAccessToken())
            .catch((err: unknown) => {
              this.snackbarsService.createSnackbar(err instanceof Error ? err.message : `Errore nel recupero dell'immagine della webcam.`, 'error', true);
              throw err;
            })
            .finally(() => this.snackbarsService.removeSnackbar(webcamSnackbarId))
          webcamPromises.push(webcamPromise);
          break;


        default:
          break;
      }
    });

    this.charts = newCharts.length > 0 ? [...this.charts, newCharts[0]] : [...this.charts];
    this.hydroImgs = [...this.hydroImgs, ...await Promise.all(hydroPromises)];
    this.webcams = [...this.webcams, ...(await Promise.all(webcamPromises)).map((url, i) => new Webcam(`webcam-${stations[i].id}`, url, stations[i].name ?? stations[i].id))];
  }

  public removeDialog(id: string): void {
    this.charts = this.charts.filter((c: MapChart) => c.id !== id);
    this.hydroImgs = this.hydroImgs.filter((img: string) => img !== id);
    this.webcams = this.webcams.filter((webcam: Webcam) => webcam.id !== id);
  }

  public async onChartParameterChange(stationCode: string, chartId: string, formChange: Record<string, string>): Promise<void> {
    const { param, initialDate, endingDate } = formChange;
    const currentDate = this.dateService.date() ?? new Date();

    const chart = this.charts.find((c: MapChart) => c.id === chartId);
    if (!chart) return;

    const chartIdx = this.charts.findIndex((c: MapChart) => c.id === chartId);
    this.areChartsDisabled = true;

    const station: StationBase | undefined = this.stations.find((s: StationBase) => s.id === stationCode);

    this.stationsService.updateChart(param, chart, this._sensorTypes, this.timeserieUrl, initialDate, endingDate, DateUtils.toDateTimeLocal(currentDate), station?.thresholdConfig, this.authService.getAccessToken())
      .then((newChart: MapChart) => {
        this.charts[chartIdx] = newChart;
      })
      .catch((err: Error) => {
        this.snackbarsService.createSnackbar(err.message, 'error', true);
      })
      .finally(() => {
        this.areChartsDisabled = false;
      })
  }

  public onChartCustomButtonClick(event: any[]): void {
    if (!Array.isArray(event)) return;
    const charts: MapChartData[] = event.filter((v: any) => v instanceof MapChartData);
    const csv = CSVUtils.convertTimestampValueArrayToCSV(charts.map((v) => v.data), ['Data', ...charts.map((v) => v.legend ?? '')]);
    Utils.downloadFile('station_chart.csv', csv);
  }

  /**
  * Check layers number in each categories in order to avoid it overpassing category number limit
  * Then redraw grouped checkboxes and reassign them
  */
  public onLayerToggled(data: any, updateUrl: boolean = true): void {
    const { id, isChecked } = data;
    if (!id || typeof isChecked !== 'boolean') return;

    this._checkLayerAndRedrawGroupedCheckboxes(id, isChecked, !!this.user);
    if (updateUrl) this._toggleLayersOnMap(this.dataLayers, this.currentDataLayers.toArray());
    if (updateUrl) this._updateLayerQueryParams(this.currentDataLayers.toArray());
    if (this.layersService.getLayerCountByCategory(this.currentDataLayers.map, 'data_wms--time') <= 0) this.wmsLayersDate = undefined;
  }

  private _checkLayerAndRedrawGroupedCheckboxes(id: string, isChecked: boolean, isAuth: boolean): void {
    const foundLayer: Layer | undefined = LayerGroup.getAllLayers(this.dataLayers).find((l: Layer) => l.id === id);
    if (!foundLayer) return;

    this._currentDataLayers = this.layersService.checkLayerCategories(foundLayer, isChecked, this._currentDataLayers, this._layerCategories, isAuth);
    this.groupedCheckboxes = this._redrawGroupedCheckboxes(this._groupedCheckboxes.map((g) => GroupedCheckboxItem.createFromObject(g.group())));
    this.cdRef.detectChanges();
  }

  private _redrawGroupedCheckboxes(groupedCheckboxes: GroupedCheckboxItem[]): GroupedCheckboxItem[] {
    const newCheckboxes: GroupedCheckboxItem[] = [];
    for (const group of groupedCheckboxes) {
      const checkedGroup = group.checkNestedCheckbox(this.currentDataLayers.toArray());
      newCheckboxes.push(checkedGroup);
    }
    return newCheckboxes;
  }

  private _toggleGroupedCheckboxes(areDisabled: boolean, groupedCheckboxes: GroupedCheckboxItem[]): GroupedCheckboxItem[] {
    const newCheckboxes: GroupedCheckboxItem[] = [];
    for (const group of groupedCheckboxes) {
      const checkedGroup = group.toggleNestedCheckbox(areDisabled);
      newCheckboxes.push(checkedGroup);
    }
    return newCheckboxes;
  }

  private async _toggleLayersOnMap(dataLayers: LayerGroup[], currentLayers: string[]): Promise<void> {
    const promises = LayerGroup.getAllLayers(dataLayers).map(async (l: Layer) => {
      if (currentLayers.includes(l.id)) {
        if (!this._map.haslayer(l.id)) await this._executeAction(l, this.dateService.date())
      } else {
        this._map.removeLayerById(l.id);
      }
    });

    await Promise.all(promises)
  }

  /** Generate color scale */
  private _generateLayerColorScale(layer: Layer, allBaseColorScales: ColorScaleBase[]): ColorScale | undefined {
    if (!layer.legend) return;

    const baseColorScale: ColorScaleBase | undefined = allBaseColorScales.find((c: ColorScaleBase) => c.id === layer.legend?.colorScaleId);
    if (!baseColorScale) return;

    return new ColorScale(baseColorScale, layer.legend);
  }

  /** Get and execute generic action from commands registry service class */
  private async _executeAction(layer: Layer, date?: Date): Promise<void> {
    if (!layer.action || !('id' in layer.action)) return;

    const command: Command | null = this.commandsRegistry.getCommand(layer.action.id);
    if (!command) return;

    let colorScale: ColorScale | undefined;
    if (layer.legend) {
      const baseColorScale: ColorScaleBase | undefined = this.baseColorScales.find((c: ColorScaleBase) => c.id === layer.legend?.colorScaleId);
      if (baseColorScale) colorScale = new ColorScale(baseColorScale, layer.legend);
    }

    const snackbarId = this.snackbarsService.createSnackbar(`Caricamento layer ${layer.label}`, 'loader', false);

    try {
      this.groupedCheckboxes = this._toggleGroupedCheckboxes(true, this._groupedCheckboxes.map((g) => GroupedCheckboxItem.createFromObject(g.group())));

      await command.execute({
        map: this._map,
        date,
        colorScale,
        layer,
        baseUrl: layer.action['api'] !== 'polygonmean' ? this.stationsApiBaseUrl : this.polygonMeanApiBaseUrl,
        stations: this.stations,
        token: this.authService.getAccessToken(),
        timeSpan: this.settings.mapTimeSpan,
        timeThreshold: this.settings.staleDataThreshold,
        multiplier: layer instanceof GeoJsonLayer && layer.multiplier,
        sensorTypes: this._sensorTypes,
        showValueOnZoom: layer instanceof GeoJsonLayer ? layer.showValueOnZoom : undefined
      });

    } catch (err: unknown) {
      this._checkLayerAndRedrawGroupedCheckboxes(layer.id, false, !!this.user);
      const isNotFoundTimError: boolean = err instanceof Error && err.message.includes('non disponibile per la data selezionata');
      this.snackbarsService.createSnackbar(err instanceof Error && isNotFoundTimError ? err.message : `Errore nel caricamento del layer ${layer.label ?? layer.id}. Riprovare.`, isNotFoundTimError ? 'success' : 'error', true);
      throw new Error(err instanceof Error ? err.message : 'Errore nel caricamento del layer');

    } finally {
      this.snackbarsService.removeSnackbar(snackbarId);
      this.groupedCheckboxes = this._toggleGroupedCheckboxes(false, this._groupedCheckboxes.map((g) => GroupedCheckboxItem.createFromObject(g.group())));
    }
  }

  // On date change
  // Call command for every not-timedimension layer
  // Call setCurrentTime() for every timedimension layer
  // Then redraw chips and grouped checkboxes based on fulfilled command promises
  public onMapDateChanged(date: Date | undefined): void {
    if (this._map) this._map.closeAllPopups();
    this.dateService.date.set(date);
    this.chartReferenceDate = date;
    this._updateMultipleLayers(date, false);
  }

  public onMapAdditionalDateChanged(date: Date | undefined): void {
    this.wmsLayersDate = date;
  }

  public onMapTimedimensionLayerNotFound(layerId: string) {
    this.onLayerToggled({ id: layerId, isChecked: false });
    const layersToRemove = this.dataLayers
      .map((g: LayerGroup) => g.searchLayerById(layerId))
      .flat()
      .filter((l) => l !== undefined);

    if (layersToRemove.length > 1) return;
    this.snackbarsService.createSnackbar(`Il layer ${layersToRemove[0].label ?? layersToRemove[0].id} non è disponibile alla data selezionata.`, 'success', false);
  }

  private _updateMultipleLayers(date: Date | undefined, isReset: boolean = false) {
    // Split current layers in timedimension and not-timedimension layers
    const { withKey: layersToKeep, withoutKey: layersToUpdate } = Utils.splitMapByKey(this.currentDataLayers.map, 'data_wms--time');

    // Remove every not-timedimension layer (except in case of map reset)
    [...layersToUpdate, ...(isReset ? layersToKeep : [])]
      .reverse()
      .forEach((id: string) => this.onLayerToggled({ id, isChecked: false }, !isReset));

    // Call command for every not-timedimension layer (except in case of map reset)
    const promises: Promise<void>[] = [];
    [...layersToUpdate, ...(isReset ? layersToKeep : [])]
      .forEach((id: string) => {
        const foundLayer: Layer | undefined = LayerGroup.getAllLayers(this.dataLayers).find((l: Layer) => l.id === id);
        if (foundLayer) promises.push(this._executeAction(foundLayer, date));
      });

    // Redraw interface
    Promise.allSettled(promises)
      .then((results) => {
        const fulfilledIndexes: number[] = results.map((r, i) => r.status === 'fulfilled' ? i : undefined).filter((r) => r !== undefined);
        const fulfilledIds = [...layersToUpdate, ...layersToKeep].filter((_, i) => fulfilledIndexes.includes(i));
        fulfilledIds.forEach((id: string) => this._checkLayerAndRedrawGroupedCheckboxes(id, true, !!this.user));
      })
      .finally(() => {
        this._updateLayerQueryParams(this.currentDataLayers.toArray())
      })
  }
}
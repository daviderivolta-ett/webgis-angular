/* Dependencies */
import { ChangeDetectorRef, Component, computed, effect, HostListener, inject, QueryList, signal, ViewChild, ViewChildren, OnInit, AfterViewInit, OnDestroy } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'

/* Models */
import { Chip, ColorScale, ColorScaleBase, Command, createDefaultStationsPopupConfig, createStationPopupConfigFromObject, GeoJsonLayer, GeojsonLegend, GroupedCheckboxItem, Layer, LayerCategory, LayerGroup, LayerGroupToCheckboxAdapter, Legend, MapChart, MapChartData, MapConfig, Sensor, SensorType, Settings, Station, StationBase, StationPopupConfig, TileLayer, User, WMSLayer, WMSLegend } from '../../../models'

/* Services */
import { ApiService, Auth2Service, CommandsRegistryService, GlobalStateService, LayersService, PopupService, SnackbarsService, StationsService } from '../../../services'

/* Components */
import { ChipComponent, GroupedCheckboxesComponent, HeaderComponent, PopUpMenuComponent, SidebarComponent, SliderComponent, FloatingDialogComponent, PlotlyChartComponent } from '../../../components'
import { MapComponent } from '../map/map.component'
import { MapPopupComponent } from '../map-popup/map-popup.component'
import { LayerLegendComponent } from '../layer-legend/layer-legend.component'
import { MapChartComponent } from '../map-chart/map-chart.component'
import { MapChartSelectorComponent } from '../map-chart-selector/map-chart-selector.component'
import { MapChartDatepickerComponent } from '../map-chart-datepicker/map-chart-datepicker.component'

/* Utilities */
import { CSVUtils, DateUtils, Utils } from '../../../utils'

/* Component */
@Component({
  selector: 'app-data-page',
  imports: [
    // Components
    HeaderComponent, SidebarComponent, MapComponent, LayerLegendComponent, PopUpMenuComponent, GroupedCheckboxesComponent, ChipComponent, MapPopupComponent, SliderComponent, FloatingDialogComponent, MapChartSelectorComponent, MapChartComponent, MapChartDatepickerComponent, PlotlyChartComponent,
    // Directives
    ReactiveFormsModule,
    // Pipes
    DatePipe,
    RouterLink
  ],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent implements OnInit, AfterViewInit, OnDestroy {
  /* Class properties */

  /* Dependency injections */
  private cdRef: ChangeDetectorRef = inject(ChangeDetectorRef)
  private route: ActivatedRoute = inject(ActivatedRoute)
  private auth2Service: Auth2Service = inject(Auth2Service)
  private apiService: ApiService = inject(ApiService)
  private popupService: PopupService = inject(PopupService)
  private globalStateService: GlobalStateService = inject(GlobalStateService)
  private snackbarsService: SnackbarsService = inject(SnackbarsService)
  private layersService: LayersService = inject(LayersService)
  private stationsService: StationsService = inject(StationsService)
  private commandsRegistry: CommandsRegistryService = inject(CommandsRegistryService)

  /* User Interface */
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
  public areChartsDisabled: boolean = true;

  private _now = signal(new Date());
  public nowStr = computed(() => DateUtils.toDateTimeLocal(this._now()));

  public referenceDate: Date | undefined;
  public selectedDate: Date | undefined;
  public timePlayerRange = computed(() => {

    return this.settings.timeRangeDays ? this.settings.timeRangeDays * 1440 : 30 * 1440;
  });
  public wmsLayersDate: Date | undefined;

  /* References */
  @ViewChild('map') _map!: MapComponent;
  @ViewChild('sidebar') _sidebar!: SidebarComponent;
  @ViewChildren('groupedCheckbox') _groupedCheckboxes!: QueryList<GroupedCheckboxesComponent>;
  @ViewChild('baseLayersMenu') _baseLayersMenu!: PopUpMenuComponent;
  @ViewChild('infoLayersMenu') _infoLayersMenu!: PopUpMenuComponent;
  @ViewChild('legendsMenu') _legendsMenu!: PopUpMenuComponent;
  @ViewChildren('chartDatePicker') _chartDatePickers!: MapChartDatepickerComponent[];

  /* Listeners */
  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
  }

  /* Data */
  public user: User | null = null;
  public refreshLayersId: number | null = null;

  public mapConfig: MapConfig; // Recovered from route resolver in constructor
  public settings: Settings; // Recovered from route resolver in constructor

  public apiBaseUrl; // Recovered from route resolver in constructor
  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public polygonMeanApiBaseUrl; // Recovered from route resolver in constructor
  public retentionBridgeUrl; // Recovered from route resolver in constructor

  public stationsUrl = computed(() => this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('stations')));
  public parametersUrl = computed(() => this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('parameters')));
  public stationParametersUrl = computed(() => this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('stationParameters')));
  public createConfigUrl; // Recovered from route resolver in constructor
  public latestConfigUrl; // Recovered from route resolver in constructor
  public timeserieUrl = computed(() => this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('timeseries')));

  public stationPopupConfig: StationPopupConfig = createStationPopupConfigFromObject({});
  public stations: StationBase[] = [];

  public baseColorScales: ColorScaleBase[]; // Recovered from route resolver in constructor
  public baseLayers: TileLayer[]; // Recovered from route resolver in constructor
  public infoLayers: WMSLayer[]; // Recovered from route resolver in constructor
  public dataLayers: LayerGroup[]; // Recovered from route resolver in constructor
  private _layerCategories: Map<string, LayerCategory>; // Recovered from route resolver in constructor
  private _sensorTypes: SensorType[]; // Recovered from route resolver in constructor

  private _currentDataLayers: Map<string, string[]> = new Map<string, string[]>();

  /* Constructor */
  constructor(
  ) {
    this.windowWidth = window.innerWidth;

    /* Recovering data from resolvers */
    this.mapConfig = this.route.snapshot.data['mapConfig'];
    this.settings = this.route.snapshot.data['settings'];

    this.apiBaseUrl = this.route.snapshot.data['apisConfig'].get('baseUrl');
    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.polygonMeanApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('polygonMeanApi'));
    this.retentionBridgeUrl = this.route.snapshot.data['apisConfig'].get('retentionBridge');

    this.createConfigUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('createConfig'));
    this.latestConfigUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('latestConfig'));
    this.baseColorScales = this.route.snapshot.data['colorScales'];
    this.baseLayers = LayerGroup.getAllLayers(this.route.snapshot.data['baseLayers']).filter((l: Layer) => l instanceof TileLayer);
    this.infoLayers = LayerGroup.getAllLayers(this.route.snapshot.data['infoLayers']).filter((l: Layer) => l instanceof WMSLayer);
    this.dataLayers = this.route.snapshot.data['groupedCheckboxes'];
    this._layerCategories = new Map(this.route.snapshot.data['layerCategories'].map((c: LayerCategory) => [c.id, c]));
    this._sensorTypes = this.route.snapshot.data['sensorTypes'];

    this.groupedCheckboxes = this.dataLayers.map((v: LayerGroup) => LayerGroupToCheckboxAdapter.convert(v));

    /* Forms init */
    this.baseLayersForm.valueChanges.subscribe((changes: unknown) => this._onBaselayersRadioChange(changes));
    if (this.infoLayers.length > 0) this.infoLayers.forEach((l: WMSLayer) => this.infoLayersForm.addControl(l.id, new FormControl(false)));
    Object.keys(this.infoLayersForm.controls).forEach((controlName: string) => {
      const control = this.infoLayersForm.get(controlName);
      if (control) control.valueChanges.subscribe((changes: boolean) => this._onInfoLayersCheckboxesChange(controlName, changes));
    })

    /* Effects */
    effect(() => {
      const currentUser = this.auth2Service.user();
      const isAuth: boolean = currentUser ? true : false;
      this._changeCheckboxesVisibility(isAuth, currentUser?.layers);
      if (!this.user && currentUser) this.setDataFromApi();
      this.user = currentUser;
    });
  }

  /* Getter and setter */
  public get currentDataLayers() {
    return {
      map: this._currentDataLayers,
      toArray: () => Array.from(this._currentDataLayers.values()).flat()
    }
  }

  /* Component lifecycle */
  public async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(() => {
      const date = this.globalStateService.getDateFromQueryParams();
      this.selectedDate = date;
    });

    await this.setDataFromApi();
    this._applyLayersFromQueryParams(new URLSearchParams(window.location.search));
    this._applyMapStateFromQueryParams(new URLSearchParams(window.location.search));
  }

  public async ngAfterViewInit(): Promise<void> {
    this.popupService.getLatestPopupConfig(this.apiService.addSearchParamsToUrl(this.latestConfigUrl, { Tag: 'popupConfig' }), this.auth2Service.token())
      .then((config: StationPopupConfig) => {
        this.stationPopupConfig = config
      })
      .catch(() => this.stationPopupConfig = createDefaultStationsPopupConfig())
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
        this.stationsService.getStationParameters(this.stationParametersUrl(), this.auth2Service.token()),
        this.stationsService.getAllStations(this.stationsUrl(), this.auth2Service.token()),
        this.stationsService.getAllParameters(this.parametersUrl(), this.auth2Service.token())
      ]);

      this._sensorTypes = this._sensorTypes.filter((s: SensorType) => sensorTypes.some((sensor: Sensor) => s.id === sensor.type || s.id === `${sensor.type}--cumulative`));
      this.stations = this.stationsService
        .mergeBaseStationsAndPickStations(allStations, stationsPick)
        .sort((a, b) => a.id.localeCompare(b.id));
    } catch {
      this.snackbarsService.createSnackbar('Errore nel recupero dei dati', 'error', true);
    } finally {
      this.isLoading = false;
    }
  }

  private _applyLayersFromQueryParams(params: URLSearchParams): void {
    const layerIds: string[] = params.getAll('layer');
    const baseLayerIds: string[] = params.getAll('base');
    const infoLayerIds: string[] = params.getAll('info');
    const lat: string[] = params.getAll('lat');
    const lon: string[] = params.getAll('lon');
    const zoom: string[] = params.getAll('zoom');

    /** Default */
    if ([...layerIds, ...baseLayerIds, ...infoLayerIds].length === 0) {
      this.baseLayersForm.patchValue({ baseLayer: this.baseLayers[0].id });                   // Base layers
      this.infoLayersForm.patchValue({ zone_di_allerta: true });                              // Info layers
      this._currentDataLayers.set('data_geojson-point', ['station_precipitations_1h']);       // Data layers
      this._updateMultipleLayers(this.globalStateService.getDateFromQueryParams(), true);
      this.globalStateService.updateAllQueryParams2(                                          // Sync query params
        new Map(Object.entries({
          base: [this.baseLayers[0].id],
          layer: ['station_precipitations_1h'],
          info: ['zone_di_allerta'],
          date: this.globalStateService.getQueryParam2('date'),
          lat,
          lon,
          zoom
        }))
      )
      return;
    }

    /** Data layers */
    const layers: Layer[] = layerIds.map((id: string) => {
      return this.dataLayers.map((g: LayerGroup) => g.searchLayerById(id))
    }).flat().filter(l => l !== undefined);

    this._currentDataLayers = layers.reduce((acc: Map<string, string[]>, curr: Layer) => {
      return this.layersService.checkLayerCategories(curr, true, acc, this._layerCategories, !!this.user);
    }, new Map(this.currentDataLayers.map));

    this._updateMultipleLayers(this.globalStateService.getDateFromQueryParams(), true);

    /** Base layer */
    const baseLayers: TileLayer[] = this.baseLayers.filter((l) => baseLayerIds.includes(l.id))
    if (baseLayers.length > 0) {
      this.baseLayersForm.patchValue({ baseLayer: baseLayers[0].id }, { emitEvent: false });
      this._map.removeLayerById('base');
      this._map.addBaseLayer(baseLayers[0].url, { ...baseLayers[0] });
      this.globalStateService.updateQueryParam2('base', [baseLayers[0].id]);
    }

    /** Info layers */
    const infoLayers: WMSLayer[] = this.infoLayers.filter((l) => infoLayerIds.includes(l.id));
    if (infoLayers.length > 0) this.infoLayersForm.patchValue(
      infoLayers.reduce<{ [key: string]: boolean }>((acc, layer) => {
        acc[layer.id] = true;
        return acc;
      }, {})
    );
  }

  private _applyMapStateFromQueryParams(params: URLSearchParams): void {
    const zoom = Number(params.get('zoom') ?? NaN);
    const lat = Number(params.get('lat') ?? NaN);
    const lon = Number(params.get('lon') ?? NaN);

    this.mapConfig = {
      ...this.mapConfig,
      position: [
        !Number.isNaN(lat) ? lat : this.mapConfig.position[0],
        !Number.isNaN(lon) ? lon : this.mapConfig.position[1]
      ],
      zoom: !Number.isNaN(zoom) ? zoom : this.mapConfig.zoom
    };
  }

  private _changeCheckboxesVisibility(isAuth: boolean, layersToShow?: string[]) {
    const authLayers = LayerGroup.getAuthLayers(this.dataLayers, isAuth, layersToShow);
    this.groupedCheckboxes = this.groupedCheckboxes.map((group: GroupedCheckboxItem) => {
      return group.visibleNestedCheckbox(authLayers);
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

  public onMapLayerAdded(event: Record<string, unknown>): void {
    const { id } = event;
    if (!id) return;

    const foundLayer: Layer | undefined = LayerGroup.getAllLayers(this.dataLayers).find((l: Layer) => l.id === id);
    if (!foundLayer) return;

    // UI Date
    this._now.set(new Date());

    // Chips
    let iconUrl: string = '';
    if (event['icon'] && event['icon'] instanceof SVGSVGElement) iconUrl = Utils.svgElementToImgSrc(event['icon']);
    let chipId: string = '';
    if (event['id'] && typeof event['id'] === 'string') chipId = event['id'];
    const chip = new Chip(chipId, foundLayer.longLabel ?? foundLayer.label ?? chipId, iconUrl);
    this.chips.push(chip);

    // Refresh   
    if (this.refreshLayersId) window.clearInterval(this.refreshLayersId);
    if (!this.globalStateService.getDateFromQueryParams()) {
      this.refreshLayersId = window.setInterval(() => this._refreshLayers(), 300000);
    }

    // Legends
    if (!foundLayer || !foundLayer.legend) return;
    const colorScale: ColorScale | undefined = this._generateLayerColorScale(foundLayer, this.baseColorScales);
    if (!colorScale) return;
    this.geojsonLegends.push({ layerId: foundLayer.id, layerLabel: foundLayer.longLabel ?? foundLayer.label, unit: foundLayer.legend.altUnit || foundLayer.legend.unit, colors: colorScale.colors, labels: foundLayer.legend.labels ?? colorScale.calculateTicks(), date: !foundLayer.layerType.includes('wms') ? this.globalStateService.getDateFromQueryParams() ?? new Date() : undefined });
    queueMicrotask(() => {
      if (this.windowWidth > 992) this._legendsMenu.togglePopUpMenu(true);
    });
  }

  public onMapLayerRemoved(event: Record<string, unknown>): void {
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
      this._executeAction(l, this.globalStateService.getDateFromQueryParams());
    });
  }

  public onMapMarkerClicked(data: Record<string, unknown>[]): void {
    const stations = data.map((d) => {
      if ('type' in d && typeof d['type'] === 'string') {
        switch (d['type']) {
          case 'lightning':
            d['stationCode'] = 'Fulminazione';
            d['unit'] = 'A';
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

  public onMapClicked(event: Record<string, unknown>) {
    const { bbox, point, size, latLng } = event;

    if (!bbox || typeof bbox !== 'string') return;

    if (typeof point !== 'object' || point === null || !('x' in point) || typeof point['x'] !== 'number' || !('y' in point) || typeof point['y'] !== 'number') return;
    if (typeof size !== 'object' || size === null || !('width' in size) || typeof size['width'] !== 'number' || !('height' in size) || typeof size['height'] !== 'number') return;
    if (typeof latLng !== 'object' || latLng === null || !('lat' in latLng) || typeof latLng['lat'] !== 'number' || (!('lng' in latLng) || typeof latLng['lng'] !== 'number')) return;

    const activeWMSLayers: WMSLayer[] = LayerGroup.getAllLayers(this.dataLayers)
      .filter((l: Layer) => this.currentDataLayers.toArray().includes(l.id))
      .filter((l: Layer) => l instanceof WMSLayer);

    if (activeWMSLayers.length === 0) return;

    const layer: WMSLayer = activeWMSLayers[0];
    this.layersService.getFeatureInfoWMSLayer(layer, bbox, point as { x: number, y: number }, size as { width: number, height: number }, this.wmsLayersDate?.toISOString())
      .then((info: [string, number][]) => {
        info.forEach(([label, value]: [string, number]) => {
          this._map.openCustomPopup(`<p><strong>${label}:</strong> ${layer.multiplier ? Utils.truncateValueByDecimals(value * layer.multiplier, layer.decimals ?? 1) : Utils.truncateValueByDecimals(value, layer.decimals ?? 1)} ${(layer.legend && layer.legend.unit) ? layer.legend.unit : ''}</p>`, latLng as { lat: number, lng: number });
        });
      })
      .catch((err: unknown) => {
        this.snackbarsService.createSnackbar(err instanceof Error ? err.message : `Errore nel recupero dei dati puntuali del layer`, 'error', true);
      })
  }

  public onMapZoomAndCenterChanged(state: Record<string, number>): void {
    if (!('lat' in state) || !('lon' in state) || !('zoom' in state)) return;
    const params = this.globalStateService.getAllQueryParams2();
    Object.entries(state).forEach(([k, v]: [string, number]) => params.set(k, [`${v}`]));
    this.globalStateService.updateQueryParams2(params);
  }

  public onFeatureClicked(event: Record<string, any>): void {
    const { coordinates, ...properties } = event;

    const activeGeoJSONLayers: GeoJsonLayer[] = LayerGroup.getAllLayers(this.dataLayers)
      .filter((l: Layer) => this.currentDataLayers.toArray().includes(l.id))
      .filter((l: Layer) => l instanceof GeoJsonLayer)
      .filter(l => l.layerCategory === 'data_wms');

    if (activeGeoJSONLayers.length === 0) return;

    const layer: GeoJsonLayer = activeGeoJSONLayers[0];
    this._map.openCustomPopup(`<p><strong>${layer.label}:</strong> ${Utils.truncateValueByDecimals(properties['mean_value'] * (layer.multiplier ? layer.multiplier : 1), layer.decimals ?? 1)} ${layer.legend && layer.legend.unit ? layer.legend.unit : ''}</p>`, coordinates);
  }

  private _onBaselayersRadioChange(changes: unknown): void {
    if (typeof changes !== 'object' || changes === null || !('baseLayer' in changes)) return;
    const layer: TileLayer | undefined = this.baseLayers.find((l: TileLayer) => l.id === changes['baseLayer']);
    if (!layer) return;
    const { id, url, ...rest } = layer;
    this._map.addBaseLayer(url, rest);
    this.globalStateService.updateQueryParam2('base', [id]);
  }

  private _onInfoLayersCheckboxesChange(layerId: string, value: boolean): void {
    if (!value) {
      this._map.removeLayerById(layerId);
      this.globalStateService.substituteQueryparams2('info', [], [layerId]);
    }
    else {
      const infoLayer: WMSLayer | undefined = this.infoLayers.find((l) => l.id === layerId);
      if (infoLayer) {
        this._map.addWMSLayer(infoLayer.id, infoLayer.url, infoLayer.params);
        this.globalStateService.substituteQueryparams2('info', [layerId], []);
      }
    }
  }

  public async onMapPopupOpenChartBtnClick(stations: Station[]): Promise<void> {
    const newCharts: MapChart[] = [];

    stations.forEach(async (s: Station) => {
      switch (s.type) {
        case 'platform': {
          const station: StationBase | undefined = this.stations.find((station: StationBase) => station.id === s.id);
          const thresholds: Record<string, number> = {};
          if (station?.thresholdConfig) Object.entries(station.thresholdConfig).forEach(([k, v]: [string, number]) => {
            if (Utils.isValidColor(k) && v) thresholds[k] = v;
          });
          const foundSensor: SensorType | undefined = this._sensorTypes.find((sensor) => sensor.id === s.parameter);
          newCharts.push(this.stationsService.createChart(s, this._sensorTypes, foundSensor && foundSensor.thresholdKeys ? thresholds : {}));
          break;
        }

        default:
          break;
      }
    });

    this.charts = newCharts.length > 0 ? [...this.charts, newCharts[0]] : [...this.charts];
  }

  public removeDialog(id: string): void {
    this.charts = this.charts.filter((c: MapChart) => c.id !== id);
  }

  public debounceOnChartParameterChange = Utils.debounce((stationCode: string, chartId: string, formChange: Record<string, string>) => this.onChartParameterChange(stationCode, chartId, formChange), 200)

  public async onChartParameterChange(stationCode: string, chartId: string, formChange: Record<string, string>): Promise<void> {
    const { param, endingDate } = formChange;
    let { initialDate } = formChange;

    const currentDate = this.globalStateService.getDateFromQueryParams() ?? new Date();

    const chart = this.charts.find((c: MapChart) => c.id === chartId);
    if (!chart) return;

    const chartIdx = this.charts.findIndex((c: MapChart) => c.id === chartId);
    this.areChartsDisabled = true;

    const station: StationBase | undefined = this.stations.find((s: StationBase) => s.id === stationCode);

    if (!initialDate) {
      const sensorType = this._sensorTypes.find((t) => t.id === param);
      initialDate = DateUtils.toDateTimeLocal(this.stationsService.getInitialDateOnSensorGap(endingDate, sensorType));
    }

    this.stationsService.updateChart(param, chart, this._sensorTypes, this.timeserieUrl(), initialDate, endingDate, DateUtils.toDateTimeLocal(currentDate), station?.thresholdConfig, this.auth2Service.token())
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

  public onChartCustomButtonClick(event: unknown[]): void {
    if (!Array.isArray(event)) return;
    const charts: MapChartData[] = event.filter((v: unknown) => v instanceof MapChartData);
    const csv = CSVUtils.convertTimestampValueArrayToCSV(charts.map((v) => v.data), ['Data', ...charts.map((v) => v.legend ?? '')]);
    Utils.downloadFile('station_chart.csv', csv);
  }

  public onParameterSaveClick(): void {
    if (!this.user) return;
    const params = this.globalStateService.getQueryParams2(['base', 'info', 'layer', 'date', 'lat', 'lon', 'zoom']);
    const snackbarId: string = this.snackbarsService.createSnackbar(`Salvataggio preferenze dell'utente in corso...`, 'loader', false, 'snackbar_user_preferences');
    this.globalStateService.saveQueryParams(this.createConfigUrl, `${this.user.id}_${new Date().getTime()}`, `${this.user.id}_preferences`, 'prod', Object.fromEntries(params), this.auth2Service.token())
      .then(() => {
        this.snackbarsService.createSnackbar(`Preferenze dell'utente salvate con successo.`, 'success', true);
      })
      .catch(() => {
        this.snackbarsService.createSnackbar(`Errore nel salvataggio delle preferenze dell'utente.`, 'error', true);
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId);
      })
  }

  /**
  * Check layers number in each categories in order to avoid it overpassing category number limit
  * Then redraw grouped checkboxes and reassign them
  */
  public onLayerToggled(data: unknown, toggleLayer: boolean = true, updateUrl: boolean = true): void {
    if (typeof data !== 'object' || data === null || !('id' in data) || !('isChecked' in data)) return;
    const { id, isChecked } = data;
    if (typeof id !== 'string' || typeof isChecked !== 'boolean') return;

    this._checkLayerAndRedrawGroupedCheckboxes(id, isChecked, !!this.user);
    if (toggleLayer) this._toggleLayersOnMap(this.dataLayers, this.currentDataLayers.toArray());
    if (updateUrl) this.globalStateService.updateQueryParam2('layer', this.currentDataLayers.toArray());
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

  // private async _toggleLayersOnMap(dataLayers: LayerGroup[], currentLayers: string[]): Promise<void> {
  //   const promises = LayerGroup.getAllLayers(dataLayers).map(async (l: Layer) => {
  //     if (currentLayers.includes(l.id)) {
  //       if (!this._map.haslayer(l.id)) await this._executeAction(l, this.globalStateService.getDateFromQueryParams())
  //     } else {
  //       this._map.removeLayerById(l.id);
  //     }
  //   });

  //   await Promise.all(promises)
  // }

  private async _toggleLayersOnMap(dataLayers: LayerGroup[], currentLayers: string[]): Promise<void> {
    const allLayers = LayerGroup.getAllLayers(dataLayers);

    const toRemove = allLayers.filter((l: Layer) => !currentLayers.includes(l.id) && this._map.haslayer(l.id));
    const toAdd = allLayers.filter((l: Layer) => currentLayers.includes(l.id) && !this._map.haslayer(l.id));

    // Rimozione sincrona, completata prima di iniziare qualsiasi aggiunta:
    // evita che due layer timedimension coesistano sul timeDimension condiviso.
    toRemove.forEach((l: Layer) => this._map.removeLayerById(l.id));

    await Promise.all(toAdd.map((l: Layer) => this._executeAction(l, this.globalStateService.getDateFromQueryParams())));
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
        date: this.auth2Service.hasValidAccessToken() ? date : undefined,
        colorScale,
        layer,
        baseUrl: layer.action['api'] !== 'polygonmean' ? this.apiService.buildUrl(this.stationsApiBaseUrl, this.retentionBridgeUrl, '') : this.polygonMeanApiBaseUrl,
        stations: this.stations,
        token: this.auth2Service.token(),
        timeSpan: this.settings.mapTimeSpan,
        timeThreshold: this.settings.staleDataThreshold,
        multiplier: layer instanceof GeoJsonLayer && layer.multiplier,
        sensorTypes: this._sensorTypes,
        showValueOnZoom: layer instanceof GeoJsonLayer ? layer.showValueOnZoom : undefined,
        markerSize: this.mapConfig.markerSize
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
    this._chartDatePickers.forEach((c) => c.setIsFirstload(true));

    if (date) this.globalStateService.updateQueryParam2('date', [this.globalStateService.toDatetimelocal(date)]);
    else this.globalStateService.removeQueryParam('date');
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

  public onMapTimedimensionEvent(event: Record<string, any>): void {
    if (!('message' in event) || !('type' in event) && (event['type'] !== 'success' || event['type'] !== 'loader' || event['type'] !== 'error')) return;
    this.snackbarsService.removeSnackbar(`snackbar_loader`);

    this.snackbarsService.createSnackbar(
      event['message'],
      event['type'],
      true,
      `snackbar_${event['type']}`
    );
  }

  private _updateMultipleLayers(date: Date | undefined, isReset: boolean = false) {
    // Split current layers in timedimension and not-timedimension layers
    const { withKey: layersToKeep, withoutKey: layersToUpdate } = Utils.splitMapByKey(this.currentDataLayers.map, 'data_wms--time');

    // Remove every not-timedimension layer (except in case of map reset)
    [...layersToUpdate, ...(isReset ? layersToKeep : [])]
      .reverse()
      .forEach((id: string) => this.onLayerToggled({ id, isChecked: false }, !isReset, false));

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
  }
}
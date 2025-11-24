/** Libraries */
import { ChangeDetectorRef, Component, effect, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Models */
import { Chip, ColorScale, ColorScaleBase, Command, GeoJsonLayer, GeojsonLegend, GroupedCheckboxItem, Layer, LayerCategory, LayerGroup, LayerGroupToCheckboxAdapter, Legend, MapChart, MapChartData, MapConfig, Sensor, SensorType, Settings, Station, StationBase, StationPopupConfig, TileLayer, WMSLayer, WMSLegend } from '../../../models';

/** Services */
import { ApiService, AuthService, CommandsRegistryService, LayersService, SnackbarsService, StationsService } from '../../../services';

/** Components */
import { ChipComponent, GroupedCheckboxesComponent, HeaderComponent, PopUpMenuComponent, SidebarComponent, SliderComponent, FloatingDialogComponent, PlotlyChartComponent } from '../../../components';
import { MapComponent } from '../map/map.component';
import { MapPopupComponent } from '../map-popup/map-popup.component';
import { LayerLegendComponent } from '../layer-legend/layer-legend.component';
import { MapChartComponent } from '../map-chart/map-chart.component';
import { MapChartSelectorComponent } from '../map-chart-selector/map-chart-selector.component';
import { MapChartDatepickerComponent } from '../map-chart-datepicker/map-chart-datepicker.component';

/** Utilities */
import { Utils } from '../../../utils';

/** Component */
@Component({
  selector: 'app-data-page',
  imports: [
    // Libraries
    ReactiveFormsModule,
    // Components
    HeaderComponent,
    SidebarComponent,
    MapComponent,
    LayerLegendComponent,
    PopUpMenuComponent,
    GroupedCheckboxesComponent,
    ChipComponent,
    MapPopupComponent,
    SliderComponent,
    FloatingDialogComponent,
    MapChartSelectorComponent,
    MapChartComponent,
    MapChartDatepickerComponent,
    PlotlyChartComponent
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
  public groupedCheckboxes: GroupedCheckboxItem[]; // Recovered from route resolver in constructor
  public chips: Chip[] = [];
  public geojsonLegends: GeojsonLegend[] = [];
  public wmsLegends: WMSLegend[] = [];

  public popupData: Station[] = [];
  public charts: MapChart[] = [];
  public hydroImgs: string[] = [];
  public areChartsDisabled: boolean = false;

  public selectedDate: Date | undefined;

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
  public user: Record<string, any> | null = null;
  public refreshLayersId: number | null = null;

  public mapConfig: MapConfig; // Recovered from route resolver in constructor
  public settings: Settings; // Recovered from route resolver in constructor

  public apiBaseUrl; // Recovered from route resolver in constructor
  public parametersUrl; // Recovered from route resolver in constructor 
  public stationParametersUrl; // Recovered from route resolver in constructor
  public timeserieUrl; // Recovered from route resolver in constructor
  public hydroImgsUrl; // Recovered from route resolver in constructor

  public stationPopupConfig: StationPopupConfig; // Recovered from route resolver in constructor
  public stations: Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>[] = [];

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
    private authService: AuthService,
    private apiService: ApiService,
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
    this.parametersUrl = this.apiService.buildUrl(this.apiBaseUrl, this.route.snapshot.data['apisConfig'].get('parameters'));
    this.stationParametersUrl = this.apiService.buildUrl(this.apiBaseUrl, this.route.snapshot.data['apisConfig'].get('stationParameters'));
    this.timeserieUrl = this.apiService.buildUrl(this.apiBaseUrl, this.route.snapshot.data['apisConfig'].get('timeseries'));
    this.hydroImgsUrl = this.apiService.buildUrl(this.apiBaseUrl, this.route.snapshot.data['apisConfig'].get('hydroImgs'));
    this.stationPopupConfig = this.route.snapshot.data['stationPopupConfig'];
    this.baseColorScales = this.route.snapshot.data['colorScales'];
    this.baseLayers = LayerGroup.getAllLayers(this.route.snapshot.data['baseLayers']).filter((l: Layer) => l instanceof TileLayer);
    this.infoLayers = LayerGroup.getAllLayers(this.route.snapshot.data['infoLayers']).filter((l: Layer) => l instanceof WMSLayer);
    this.dataLayers = this.route.snapshot.data['groupedCheckboxes'];
    this._layerCategories = new Map(this.route.snapshot.data['layerCategories'].map((c: LayerCategory) => [c.id, c]));
    this._sensorTypes = this.route.snapshot.data['sensorTypes'];

    this.baseLayersForm.valueChanges.subscribe((changes: any) => this._onBaselayersRadioChange(changes));
    this.groupedCheckboxes = this.dataLayers.map((v: LayerGroup) => LayerGroupToCheckboxAdapter.convert(v));

    /** Effetcs */
    effect(() => {
      const currentUser = this.authService.user();
      const isAuth: boolean = currentUser ? true : false;
      this._changeCheckboxesVisibility(isAuth);
      if (!this.user && currentUser) this.setDataFromApi();
      this.user = currentUser;
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
  public async ngOnInit(): Promise<void> {
    this.setDataFromApi();
  }

  public ngAfterViewInit(): void {
    if (this.baseLayers.length > 0) this.baseLayersForm.get('baseLayer')?.setValue(this.baseLayers[0].id);
  }

  /** Methods  */
  /** Init */
  public setDataFromApi() {
    this.isLoading = true;
    this.stationsService.getStationParameters(this.stationParametersUrl, this.authService.getAccessToken())
      .then((stations) => {
        this.stations = stations.sort((a, b) => a.id.localeCompare(b.id));
      })
      .catch(() => {
        this.snackbarsService.createSnackbar('Errore nel recupero dei parametri delle stazioni', 'error', true);
      })
      .finally(() => {
        this.isLoading = false;
      })

    this.isLoading = true;
    this.stationsService.getAllParameters(this.parametersUrl, this.authService.getAccessToken())
      .then((data) => {
        this._sensorTypes = this._sensorTypes.filter((s: SensorType) => data.some((sensor: Sensor) => s.id === sensor.type));
      })
      .catch(() => {
        this.snackbarsService.createSnackbar('Errore nel recupero dei parametri', 'error', true);
      })
      .finally(() => {
        this.isLoading = false;
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

    let iconUrl: string = '';
    if (event['icon'] && event['icon'] instanceof SVGSVGElement) iconUrl = Utils.svgElementToImgSrc(event['icon']);
    const chip = new Chip(event['id'], foundLayer.label ?? event['id'], iconUrl);
    this.chips.push(chip);

    if (foundLayer instanceof WMSLayer) {
      this.layersService.getWMSLayerLegend(foundLayer)
        .then((imgUrl: string) => {
          this.wmsLegends.push({ layerId: foundLayer.id, layerLabel: foundLayer.label, unit: '', imgUrl, date: this.selectedDate ?? new Date() });
        })
        .catch((err: unknown) => this.snackbarsService.createSnackbar(err instanceof Error ? err.message : 'Errore', 'error', true));
    }

    if (foundLayer instanceof GeoJsonLayer) {
      if (!foundLayer || !foundLayer.legend) return;
      const colorScale: ColorScale | undefined = this._generateLayerColorScale(foundLayer, this.baseColorScales);
      if (!colorScale) return;
      this.geojsonLegends.push({ layerId: foundLayer.id, layerLabel: foundLayer.label, unit: foundLayer.legend.unit, colors: colorScale.colors, labels: foundLayer.legend.labels ?? colorScale.calculateLabels(), date: this.selectedDate ?? new Date() });
    }

    if (this.refreshLayersId) window.clearInterval(this.refreshLayersId);
    if (this.selectedDate) {
      this.refreshLayersId = window.setInterval(() => {
        this._refreshLayers();
      }, 300000);
    }
  }

  public onMapLayerRemoved(event: Record<string, any>): void {
    const id = event['id'];
    if (!id) return;
    this.chips = this.chips.filter((c: Chip) => c.id !== id);
    this.geojsonLegends = this.geojsonLegends.filter((l: Legend) => l.layerId !== id);
    this.wmsLegends = this.wmsLegends.filter((l: Legend) => l.layerId !== id);
  }

  private _refreshLayers(): void {
    const currentLayerIds = Array.from(this._currentDataLayers.values()).flat();

    if (currentLayerIds.length === 0) {
      if (this.refreshLayersId) window.clearInterval(this.refreshLayersId)
      return;
    }

    const allLayers = LayerGroup.getAllLayers(this.dataLayers);
    const currentLayers = allLayers.filter((l: Layer) => currentLayerIds.includes(l.id));
    currentLayers.forEach((l: Layer) => {
      this._map.removeLayerById(l.id);
      this._executeAction(l, this.selectedDate);
    });
  }

  public onMapMarkerClicked(data: Record<string, any>[]): void {
    console.log(data);    
    const stations = data.map((d: any) => {
      if ('type' in d && typeof d['type'] === 'string' && d['type'] === 'lightning') {
        d['stationCode'] = 'Fulminazione';
        d['unit'] = 'A';
      }

      if ('type' in d && typeof d['type'] === 'string' && d['type'] === 'hydro') {
        d['value'] = 0;
      }

      const stationBase = StationBase.createFromGeoJSONProps(d);
      const stationData = Station.createStationDataFromGeoJSONProps(d);
      const station = Station.fromStationData(stationBase, stationData);
      return station.addSensorsFromStationLists(this.stations);
    });
    this.popupData = [...stations];
  }

  private _onBaselayersRadioChange(changes: any): void {
    const layer: TileLayer | undefined = this.baseLayers.find((l: TileLayer) => l.id === changes['baseLayer']);
    if (!layer) return;
    const { id, label, url, ...rest } = layer;
    this._map.addBaseLayer(url, rest);
  }

  public onInfoLayerCheckboxChange(event: Event, layer: WMSLayer): void {
    const value = (event.target as HTMLInputElement).checked;
    const { id, url, params } = layer;
    if (value) this._map.addWMSLayer(id, url, params);
    else this._map.removeLayerById(id);
  }

  public async onMapPopupOpenChartBtnClick(stations: Station[]): Promise<void> {
    const newCharts: MapChart[] = [];
    const hydroPromises: Promise<string>[] = [];

    stations.forEach((s: Station) => {
      const sensorType: SensorType | undefined = this._sensorTypes.find((t) => t.id === s.parameter);

      switch (s.type) {
        case 'hydro':
          const date = this.stationsService.getHydroDateFromSubfolder(this.selectedDate ?? new Date(), s['subfolder'] ?? '');
          const promise = this.stationsService.getHydroImageAt(this.hydroImgsUrl, s.parameter, s.id, date, this.authService.getAccessToken())
            .catch((err: unknown) => {
              this.snackbarsService.createSnackbar(err instanceof Error ? err.message : `Errore nel recupero dell'immagine dell'hydro.`, 'error', true);
              throw err;
            })
          hydroPromises.push(promise);
          break;

        default:
          const stationSensorTypeIds = s.sensors.filter((s: Sensor) => s.enabled).map((s: Sensor) => s.type);
          const stationSensorTypes = this._sensorTypes.filter((t: SensorType) => stationSensorTypeIds.includes(t.id) && t.isFeatured);
          const sensorType = this._sensorTypes.find((t: SensorType) => t.id === s.parameter);

          newCharts.push(
            new MapChart(
              s.id,
              [],
              s.parameter,
              stationSensorTypes,
              undefined,
              s.name ?? s.parameter,
              sensorType ? sensorType.label : s.parameter,
              'Data',
              '',
              undefined,
              sensorType ? sensorType.label : s.parameter,
              s.unit ? `(${s.unit})` : '',
              sensorType?.range
            ));
          break;
      }
    });

    this.charts = [...this.charts, ...newCharts];

    this.hydroImgs = [...this.hydroImgs, ...await Promise.all(hydroPromises)];
  }

  public removeDialog(id: string): void {
    this.charts = this.charts.filter((c: MapChart) => c.id !== id);
    this.hydroImgs = this.hydroImgs.filter((img: string) => img !== id);
  }

  public async onChartParameterChange(chartId: string, formChange: Record<string, string>): Promise<void> {
    const { param, initialDate, endingDate } = formChange;

    const chart = this.charts.find((c: MapChart) => c.id === chartId);
    if (!chart) return;

    const chartIdx = this.charts.findIndex((c: MapChart) => c.id === chartId);
    this.areChartsDisabled = true;
    const sensorType = this._sensorTypes.find((t: SensorType) => t.id === param);
    const relatedSensors = this._sensorTypes.filter((t: SensorType) => sensorType?.relatedSensors.includes(t.id));
    const sensors = [sensorType, ...relatedSensors].filter((s) => s !== undefined);

    this.stationsService.getTimeSerie(this.timeserieUrl, chart.stationId, [param, ...(sensorType?.relatedSensors ?? [])], initialDate, endingDate, this.authService.getAccessToken())
      .then((data: [number, number][][]) => {

        const chartData: MapChartData[] = sensors.map((t: SensorType, i: number) => {
          return new MapChartData(
            t.chartType,
            data[i],
            t.label,
            t.unit,
            t.style
          )
        });

        const newChart: MapChart = {
          ...chart,
          data: chartData,
          currentParameter: param,
          currentParameterLabel: sensorType ? sensorType.label : param,
          yLabel: sensorType ? sensorType.label : param,
          yUnit: sensorType ? `(${sensorType.unit})` : '',
          yRange: sensorType ? sensorType.range : [],
        }
        this.charts[chartIdx] = newChart;
      })
      .catch((err: unknown) => console.error(err))
      .finally(() => this.areChartsDisabled = false)
  }

  /**
  * Check layers number in each categories in order to avoid it overpassing category number limit
  * Then redraw grouped checkboxes and reassign them
  */
  public onLayerToggled(data: any): void {
    const { id, isChecked } = data;
    if (!id || typeof isChecked !== 'boolean') return;

    this._checkLayerAndRedrawGroupedCheckboxes(id, isChecked, !!this.user);
    this._toggleLayersOnMap(this.dataLayers, this.currentDataLayers.toArray());
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

  private _toggleLayersOnMap(dataLayers: LayerGroup[], currentLayers: string[]): void {
    LayerGroup.getAllLayers(dataLayers).forEach(async (l: Layer) => {
      if (currentLayers.includes(l.id)) {
        if (!this._map.haslayer(l.id)) await this._executeAction(l, this.selectedDate);
      } else {       
        this._map.removeLayerById(l.id);
      }
    });
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
        baseUrl: this.apiBaseUrl,
        stations: this.stations,
        token: this.authService.getAccessToken(),
        timeSpan: this.settings.mapTimeSpan,
        timeThreshold: this.settings.staleDataThreshold
      });

    } catch (err: unknown) {
      this._checkLayerAndRedrawGroupedCheckboxes(layer.id, false, !!this.user);
      this.snackbarsService.createSnackbar(err instanceof Error ? err.message : 'Errore nel caricamento del layer', 'error', true);
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
    this.selectedDate = date;

    // Split current layers in timedimension and not-timedimension layers
    const { withKey: layersToKeep, withoutKey: layersToUpdate } = Utils.splitMapByKey(this.currentDataLayers.map, 'data_wms--time');
    layersToUpdate
      .reverse()
      .forEach((id: string) => this.onLayerToggled({ id, isChecked: false }));

    // Call command for every not-timedimension layer
    const promises: Promise<void>[] = [];
    layersToUpdate.forEach((id: string) => {
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
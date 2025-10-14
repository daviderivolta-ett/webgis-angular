/** Libraries */
import { Component, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Models */
import { Chip, ColorScale, ColorScaleBase, Command, GroupedCheckboxItem, Layer, LayerCategory, LayerGroup, LayerGroupToCheckboxAdapter, Legend, MapChart, MapConfig, Sensor, SensorType, Station, StationBase, StationPopupConfig, TileLayer, WMSLayer } from '../../../models';

/** Services */
import { ApiService, CommandsRegistryService, LayersService, StationsService } from '../../../services';

/** Components */
import { ChipComponent, GroupedCheckboxesComponent, HeaderComponent, PopUpMenuComponent, SidebarComponent, SliderComponent, FloatingDialogComponent, PlotlyLineComponent } from '../../../components';
import { MapComponent } from '../map/map.component';
import { MapPopupComponent } from '../map-popup/map-popup.component';
import { LayerLegendComponent } from '../layer-legend/layer-legend.component';

/** Utilities */
import { Utils } from '../../../utils';
import { MapChartSelectorComponent } from "../map-chart-selector/map-chart-selector.component";
import { MapChartComponent } from "../map-chart/map-chart.component";

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
    PlotlyLineComponent,
    MapChartSelectorComponent,
    MapChartComponent
  ],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent {
  /*
  * Class properties
  */

  /** User Interface */
  public windowWidth: number;
  public isSliderCollapsed: boolean = false;

  public baseLayersForm: FormGroup = new FormGroup({
    baseLayer: new FormControl()
  });
  public groupedCheckboxes: GroupedCheckboxItem[]; // Recovered from route resolver in constructor
  public chips: Chip[] = [];
  public legends: Legend[] = [];

  private _selectedDate: Date | undefined;

  @ViewChild('map') _map!: MapComponent;
  @ViewChild('sidebar') _sidebar!: SidebarComponent;
  @ViewChildren('groupedCheckbox') _groupedCheckboxes!: QueryList<GroupedCheckboxesComponent>;
  @ViewChild('baseLayersMenu') _baseLayersMenu!: PopUpMenuComponent;
  @ViewChild('infoLayersMenu') _infoLayersMenu!: PopUpMenuComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowWidth = window.innerWidth;
  }

  /** Data */
  public mapConfig: MapConfig; // Recovered from route resolver in constructor
  public timeserieUrl; // Recovered from route resolver in constructor
  public stationPopupConfig: StationPopupConfig; // Recovered from route resolver in constructor
  public stations: StationBase[]; // Recovered from route resolver in constructor
  public baseColorScales: ColorScaleBase[]; // Recovered from route resolver in constructor
  public baseLayers: TileLayer[]; // Recovered from route resolver in constructor
  public infoLayers: WMSLayer[]; // Recovered from route resolver in constructor
  public dataLayers: LayerGroup[]; // Recovered from route resolver in constructor
  private _layerCategories: Map<string, LayerCategory>; // Recovered from route resolver in constructor
  private _sensorTypes: SensorType[]; // Recovered from route resolver in constructor

  private _currentDataLayers: Map<string, string[]> = new Map<string, string[]>();

  public popupData: Station[] = [];
  public charts: MapChart[] = [];
  public areChartsDisabled: boolean = false;

  /** Constructor */
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private layersService: LayersService,
    private stationsService: StationsService,
    private commandsRegistry: CommandsRegistryService
  ) {
    this.windowWidth = window.innerWidth;

    // Recovering data from resolvers
    this.mapConfig = this.route.snapshot.data['mapConfig'];
    this.timeserieUrl = this.route.snapshot.data['apisConfig'].get('timeseries');
    this.stationPopupConfig = this.route.snapshot.data['stationPopupConfig'];
    this.stations = this.route.snapshot.data['stations'];
    this.baseColorScales = this.route.snapshot.data['colorScales'];
    this.baseLayers = LayerGroup.getAllLayers(this.route.snapshot.data['baseLayers']).filter((l: Layer) => l instanceof TileLayer);
    this.infoLayers = LayerGroup.getAllLayers(this.route.snapshot.data['infoLayers']).filter((l: Layer) => l instanceof WMSLayer);
    this.dataLayers = this.route.snapshot.data['groupedCheckboxes'];
    this._layerCategories = new Map(this.route.snapshot.data['layerCategories'].map((c: LayerCategory) => [c.id, c]));
    this._sensorTypes = this.route.snapshot.data['sensorTypes'];

    this.baseLayersForm.valueChanges.subscribe((changes: any) => this._onBaselayersRadioChange(changes));
    this.groupedCheckboxes = this.dataLayers.map((v: LayerGroup) => LayerGroupToCheckboxAdapter.convert(v));
  }

  /** Getter and setter */
  public get currentDataLayers() {
    return {
      map: this._currentDataLayers,
      toArray: () => Array.from(this._currentDataLayers.values()).flat()
    }
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    // console.log(this.timeserieUrl);
  }

  public ngAfterViewInit(): void {
    if (this.baseLayers.length > 0) this.baseLayersForm.get('baseLayer')?.setValue(this.baseLayers[0].id);
  }

  /*
  * Methods
  */
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

    if (!foundLayer || !foundLayer.legend) return;
    const colorScale: ColorScale | undefined = this._generateLayerColorScale(foundLayer, this.baseColorScales);
    if (!colorScale) return;
    this.legends.push({ layerId: foundLayer.id, layerLabel: foundLayer.label, unit: foundLayer.legend.unit, colors: colorScale.colors, labels: foundLayer.legend.labels ?? colorScale.calculateLabels() });
  }

  public onMapLayerRemoved(event: Record<string, any>): void {
    const id = event['id'];
    if (!id) return;
    this.chips = this.chips.filter((c: Chip) => c.id !== id);
    this.legends = this.legends.filter((l: Legend) => l.layerId !== id);
  }

  public onMapMarkerClicked(data: Record<string, any>[]): void {
    const stations = data.map((d: any) => {
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
    const dataPromises: Promise<any>[] = stations.map((s: Station) => {
      return this.getTimeserie(this.timeserieUrl, '7b2244a3-3241-41b8-9aab-1fa02592a1d8', s.parameter);
    });

    const results = await Promise.allSettled(dataPromises);

    this.charts = [
      ...this.charts,
      ...stations.map((s: Station, i: number) => {
        const stationSensorTypeIds = s.sensors.map((s: Sensor) => s.type);
        const stationSensorTypes = this._sensorTypes.filter((t: SensorType) => stationSensorTypeIds.includes(t.id));
        const data = results[i].status === 'fulfilled' && results[i].value ? results[i].value : [];
        const sensorType = this._sensorTypes.find((t: SensorType) => t.id === s.parameter);

        return new MapChart(
          s.parameter,
          '',
          s.unit ? `(${s.unit})` : '',
          data,
          stationSensorTypes,
          undefined,
          s.name,
          sensorType ? sensorType.label : s.parameter,
          'Data',
          sensorType ? sensorType.label : s.parameter,
          [sensorType ? sensorType.label : s.parameter]
        )
      })
    ];
  }

  public async getTimeserie(url: string, stationId: string, param: string): Promise<any> {
    const formattedUrl: string = this.apiService.replaceApiUrlPlaceholder(url, stationId);
    return this.apiService.getApiJSONData(formattedUrl)
      .then((rawData: any) => this.stationsService.parseTimeSerie(rawData, param))
      .catch(() => [])
  }

  public removeDialog(id: string): void {
    this.charts = this.charts.filter((c: MapChart) => c.id !== id);
  }

  public async onChartParameterChange(chartId: string, param: string): Promise<void> {
    const chart = this.charts.find((c: MapChart) => c.id === chartId);
    if (!chart) return;

    const chartIdx = this.charts.findIndex((c: MapChart) => c.id === chartId);
    this.areChartsDisabled = true;
    this.getTimeserie(this.timeserieUrl, '7b2244a3-3241-41b8-9aab-1fa02592a1d8', param)
      .then((data: any) => {
        const sensorType = this._sensorTypes.find((t: SensorType) => t.id === param);
        const newChart = {
          ...chart,
          parameter: param,
          parameterLabel: sensorType ? sensorType.label : param,
          data,
          yLabel: sensorType ? sensorType.label : param,
          yUnit: sensorType ? `(${sensorType.unit})` : '',
          legends: [sensorType ? sensorType.label : param]
        };
        this.charts[chartIdx] = newChart;
      })
      .catch((err: unknown) => {
        console.error(err);
      })
      .finally(() => this.areChartsDisabled = false);
  }

  /**
  * Check layers number in each categories in order to avoid it overpassing category number limit
  * Then redraw grouped checkboxes and reassign them
  */
  public onLayerToggled(data: any): void {
    const { id, isChecked } = data;
    if (!id || typeof isChecked !== 'boolean') return;

    this._checkLayerAndRedrawGroupedCheckboxes(id, isChecked);
    this._toggleLayersOnMap(this.dataLayers, this.currentDataLayers.toArray());
  }

  private _checkLayerAndRedrawGroupedCheckboxes(id: string, isChecked: boolean): void {
    const foundLayer: Layer | undefined = LayerGroup.getAllLayers(this.dataLayers).find((l: Layer) => l.id === id);
    if (!foundLayer) return;

    this._currentDataLayers = this.layersService.checkLayerCategories(foundLayer, isChecked, this._currentDataLayers, this._layerCategories);
    this.groupedCheckboxes = this._redrawGroupedCheckboxes(this._groupedCheckboxes.map((g) => GroupedCheckboxItem.createFromObject(g.group())));
  }

  private _redrawGroupedCheckboxes(groupedCheckboxes: GroupedCheckboxItem[]): GroupedCheckboxItem[] {
    const newCheckboxes: GroupedCheckboxItem[] = [];
    for (const group of groupedCheckboxes) {
      const newGroup = group.checkNestedCheckbox(this.currentDataLayers.toArray());
      newCheckboxes.push(newGroup)
    }
    return newCheckboxes;
  }

  private _toggleLayersOnMap(dataLayers: LayerGroup[], currentLayers: string[]): void {
    LayerGroup.getAllLayers(dataLayers).forEach(async (l: Layer) => {
      if (currentLayers.includes(l.id)) {
        if (!this._map.haslayer(l.id)) await this._executeAction(l, this._selectedDate);
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

    try {
      await command.execute({
        map: this._map,
        date,
        colorScale,
        layer
      });
    } catch (error) {
      console.log(error);
    }
  }

  // On date change
  // Call command for every not-timedimension layer
  // Call setCurrentTime() for every timedimension layer
  // Then redraw chips and grouped checkboxes based on fulfilled command promises
  public onMapDateChanged(date: Date | undefined): void {
    this._selectedDate = date;

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
        fulfilledIds.forEach((id: string) => this._checkLayerAndRedrawGroupedCheckboxes(id, true));
      })
  }
}
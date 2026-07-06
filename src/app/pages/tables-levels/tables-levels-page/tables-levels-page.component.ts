/** Dependencies */
import { Component, computed, effect, ViewChild } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'

/** Models */
import { MapChart, MapChartData, Sensor, SensorType, Settings, Station, StationBase, Table2, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, Tenant, TreeNode, User } from '../../../models'

/** Services */
import { ApiService, AuthService, GlobalStateService, SnackbarsService, StationsService, TablesService, TenantsService } from '../../../services'

/** Components */
import { SidebarComponent, HeaderComponent, SortableTableComponent, SortHeaderComponent, DatepickerComponent, FloatingDialogComponent, PlotlyChartComponent, NotificationIconComponent, DatePickerComponent } from '../../../components'

/** Directives */
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive'

/** Pipes */
import { IsDatePipe, MapValuePipe } from '../../../pipes'

/** Utils */
import { CSVUtils, DateUtils, Utils } from '../../../utils'
import { MapChartComponent } from "../../data/map-chart/map-chart.component";
import { MapChartDatepickerComponent } from "../../data/map-chart-datepicker/map-chart-datepicker.component";
import { MapChartSelectorComponent } from "../../data/map-chart-selector/map-chart-selector.component";

/** Types */
type PageTable = {
  id: string,
  label: string,
  table: Table2
}

/** Component */
@Component({
  selector: 'app-tables-levels-page',
  imports: [
    /** Components */
    HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, NotificationIconComponent,
    DatePickerComponent,
    /** Directives */
    RouterLink, ScrollableTableDirective, RouterLinkActive,
    /** Pipes */
    MapValuePipe, IsDatePipe, DatePipe,
    FloatingDialogComponent,
    MapChartComponent,
    PlotlyChartComponent,
    MapChartDatepickerComponent,
    MapChartSelectorComponent
  ],
  templateUrl: './tables-levels-page.component.html',
  styleUrl: './tables-levels-page.component.scss'
})
export class TablesLevelsPageComponent {
  /** User interface */
  public navGroups: TreeNode[] = [];
  public configGroup: TableConfigGroup | undefined;

  public referenceDate: Date | undefined;
  public selectedDate: Date | undefined;

  public tables: PageTable[] = [];
  public sortedTables: PageTable[] = [];

  public chart: MapChart | null = null;
  public isChartLoading: boolean = false;

  /** Data */
  public user: User | null = null;
  public settings: Settings; // Recovered from route resolver in constructor

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public retentionBridgeUrl; // Recovered from route resolver in constructor

  public stationsUrl = computed(() => this.tenantsService.buildUrlWithTenant(this.stationsApiBaseUrl, this.retentionBridgeUrl, this.route.snapshot.data['apisConfig'].get('stations')));
  public parametersUrl = computed(() => this.tenantsService.buildUrlWithTenant(this.stationsApiBaseUrl, this.retentionBridgeUrl, this.route.snapshot.data['apisConfig'].get('parameters')));
  public stationParametersUrl = computed(() => this.tenantsService.buildUrlWithTenant(this.stationsApiBaseUrl, this.retentionBridgeUrl, this.route.snapshot.data['apisConfig'].get('stationParameters')));
  public timeserieUrl = computed(() => this.tenantsService.buildUrlWithTenant(this.stationsApiBaseUrl, this.retentionBridgeUrl, this.route.snapshot.data['apisConfig'].get('timeseries')));

  public stations: StationBase[] = [];

  private _tableConfigGroups: TableConfigGroup[]; // Recovered from route resolver in constructor
  public tableLabels: Map<string, string>; // Recovered from route resolver in constructor
  private _sensorTypes: SensorType[]; // Recovered from route resolver in constructor

  private _selectedTenant; // Recovered from service in constructor
  public selectedTenantMsg; // Recovered from service in constructor
  public timePlayerRange = computed(() => {
    const selectedTenant: Tenant | null = this._selectedTenant();
    if (!selectedTenant) return this.settings.timeRangeDays ? this.settings.timeRangeDays * 1440 : 30 * 1440;
    return DateUtils.minutesBetweenTwoDates(new Date(selectedTenant.toDate), new Date(selectedTenant.fromDate));
  });

  /** References */
  @ViewChild('sidebar') _sidebar!: SidebarComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private tenantsService: TenantsService,
    private globalStateService: GlobalStateService,
    private stationsService: StationsService,
    private tablesService: TablesService,
    private snackbarsService: SnackbarsService
  ) {
    /** Recovering from services */
    this._selectedTenant = this.tenantsService.selectedTenant;
    this.selectedTenantMsg = this.tenantsService.message;
    this.referenceDate = this.tenantsService.selectedTenant() ? new Date(this.tenantsService.selectedTenant()!.toDate) : undefined;

    /** Recovering data from resolvers */
    this.settings = this.route.snapshot.data['settings'];

    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.retentionBridgeUrl = this.route.snapshot.data['apisConfig'].get('retentionBridge');

    this._tableConfigGroups = this.route.snapshot.data['tableConfigGroups'];
    this.tableLabels = this.route.snapshot.data['tableLabels'];
    this._sensorTypes = this.route.snapshot.data['sensorTypes'];

    /** Effects */
    effect(() => {
      this.user = this.authService.user();
      this._initNavbar();
    });
  }

  /** Component lifecycle */
  public async ngOnInit(): Promise<void> {
    this._initNavbar();
    await this.setDataFromApi();

    this.route.queryParams.subscribe(() => {
      const dateStr: string | undefined = this.globalStateService.getQueryParam2('date')[0];
      const date: Date | undefined = !isNaN(new Date(dateStr).getTime()) ? new Date(dateStr) : undefined;

      const tenantDate = this._selectedTenant() ? new Date(this._selectedTenant()!.toDate) : undefined;
      const newDate = !date && tenantDate ? tenantDate : date;

      this.selectedDate = !date && tenantDate ? tenantDate : date;
      this._init('livelli-idrometrici', newDate ?? new Date());
    });
  }

  /** Methods */
  public async setDataFromApi() {
    try {
      const [stationsPick, allStations, sensorTypes] = await Promise.all([
        this.stationsService.getStationParameters(this.stationParametersUrl(), this.authService.getAccessToken()),
        this.stationsService.getAllStations(this.stationsUrl(), this.authService.getAccessToken()),
        this.stationsService.getAllParameters(this.parametersUrl(), this.authService.getAccessToken())
      ]);

      this._sensorTypes = this._sensorTypes.filter((s: SensorType) => sensorTypes.some((sensor: Sensor) => s.id === sensor.type || s.id === `${sensor.type}--cumulative`));
      this.stations = this.stationsService
        .mergeBaseStationsAndPickStations(allStations, stationsPick)
        .sort((a, b) => a.id.localeCompare(b.id));
    } catch (error) {
      this.snackbarsService.createSnackbar('Errore nel recupero dei dati', 'error', true);
    }
  }

  private _initNavbar() {
    this.navGroups = this._tableConfigGroups
      .filter((g: TableConfigGroup) => !g.requiresAuth || this.user)
      .map((g: TableConfigGroup) => TableConfigGroupToTreeNodeAdapter.convert(g));
  }

  private async _init(id: string, date: Date): Promise<void> {
    this._reset();
    if (this._sidebar) this._sidebar.toggleSidebar(false);

    this.configGroup = this._initConfigGroup(id);
    if (!this.configGroup) return;

    const res: any = await this._getData(this.configGroup.options[0], date);
    if (!res) return;
    
    const tables = this._createTables(res, this.configGroup);   
    this.tables = this.sortedTables = tables.map((t) => ({ ...t, table: t.table.sortTableData('stationName', 'asc') }));
  }

  private _initConfigGroup(id: string): TableConfigGroup | undefined {
    const config: TableConfigGroup | undefined = this._tableConfigGroups.find(g => g.id === id);

    if (!config) {
      this._tableConfigGroups.length > 0 ? this.router.navigateByUrl(`/tabelle/${this._tableConfigGroups[0].options[0].id}`) : '';
      return undefined;
    }
    return config;
  }

  private _reset(): void {
    this.tables = this.sortedTables = [];
  }

  private async _getData(config: TableConfig, date: Date): Promise<any> {
    const baseUrl: string = this.tenantsService.buildUrlWithTenant(this.stationsApiBaseUrl, this.retentionBridgeUrl, config.url);
    const url = date ?
      `${baseUrl}?time=${DateUtils.toApiFormat(date.toISOString())}` :
      `${baseUrl}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    this.isChartLoading = true;
    const response = await this.apiService.getApiData(url, this.authService.getAccessToken())
      .catch((err: any) => {
        this.snackbarsService.createSnackbar(`Errore nel recupero dei dati delle tabelle.`, 'error', true);
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId);
        this.isChartLoading = false;
      })

    return (!Array.isArray(response) || response.length === 0) ? undefined : response;
  }

  private _createTables(data: any, configGroup: TableConfigGroup): PageTable[] {
    return data.map((t: any, i: number) => {
      const { tableName, tableRows } = t;
      if (!tableName || typeof tableName !== 'string' || !tableRows || !Array.isArray(tableRows)) return undefined;
      const config: TableConfig | undefined = configGroup.options.find((c: TableConfig) => c.dataPath === tableName);
      if (!config) return undefined;

      const rawData = this.tablesService.parseNestedTableData(tableRows, 'values', config.keysToMerge ?? []);
      const table = Table2.generateTableStructure(rawData, 'name', config.keysOrder, config.actionKey, config.labels, config.decimals);

      return {
        id: config.id,
        label: config.label ?? config.id,
        table
      }
    }).filter((d: unknown) => d !== undefined)
  }

  public sortData(sort: { sortBy: string, direction: 'asc' | 'desc' | 'none' }, tableId: string): void {
    const foundTable: PageTable | undefined = this.tables.find((t: PageTable) => t.id === tableId);
    if (!foundTable) return;
    this.sortedTables = this.sortedTables.map((t: PageTable) => {
      return t.id === tableId ?
        { ...t, table: t.table.sortTableData(sort.sortBy, sort.direction) } :
        t
    })
  }

  public onDownloadBtnClick(tableId: string): void {
    const foundTable: PageTable | undefined = this.tables.find((t: PageTable) => t.id === tableId);
    if (!foundTable) return;
    const table = foundTable.table.convertTableToArray();
    const csv = CSVUtils.convertArrayToCSV(table, foundTable.table.header);
    const tableConfig = TableConfigGroup.findTableConfig(tableId, this._tableConfigGroups);
    if (!tableConfig) return;
    Utils.downloadFile(`${tableConfig.id}.csv`, csv);
  }

  public onDateChange(date: Date | undefined): void {
    const current: Date | undefined = this.globalStateService.getDateFromQueryParams();
    if (current?.getTime() === date?.getTime()) return;
    date ?
      this.globalStateService.updateQueryParam2('date', [this.globalStateService.toDatetimelocal(date)]) :
      this.globalStateService.removeQueryParam('date');
  }

  public async onCellClick(cell: any, tableId: string): Promise<void> {
    const hiddenValue: string | undefined = cell['hiddenValue'];
    if (!hiddenValue) return;

    const tableConfig = TableConfigGroup.findTableConfig(tableId, this._tableConfigGroups);
    if (!tableConfig) return;

    const stationBase = this.stations.find((s) => s.id === hiddenValue);
    if (!stationBase) return;
    const station: Station = Station.fromStationData(stationBase, { value: cell['value'], parameter: tableConfig.parameter ? tableConfig.parameter : '' })

    const thresholds: Record<string, number> = {};
    if (station?.thresholdConfig) Object.entries(station.thresholdConfig).forEach(([k, v]: [string, number]) => {
      if (Utils.isValidColor(k) && v) thresholds[k] = v;
    });
    const foundSensor: SensorType | undefined = this._sensorTypes.find((sensor) => sensor.id === station.parameter);
    let chart = this.stationsService.createChart(station, this._sensorTypes, foundSensor && foundSensor.thresholdKeys ? thresholds : {});
    this.chart = chart;
  }

  public async onChartParameterChange(stationCode: string, formChange: Record<string, string>): Promise<void> {
    let { param, initialDate, endingDate } = formChange;
    const currentDateStr: string | undefined = this.globalStateService.getQueryParam2('date')[0];
    const currentDate = !isNaN(new Date(currentDateStr).getTime()) ? new Date(currentDateStr) : new Date();

    if (!this.chart) return;

    this.isChartLoading = true;

    const station: StationBase | undefined = this.stations.find((s: StationBase) => s.id === stationCode);

    if (!initialDate) {
      const sensorType = this._sensorTypes.find((t) => t.id === param);
      initialDate = DateUtils.toDateTimeLocal(this.stationsService.getInitialDateOnSensorGap(endingDate, sensorType));
    }

    this.stationsService.updateChart(param, this.chart, this._sensorTypes, this.timeserieUrl(), initialDate, endingDate, DateUtils.toDateTimeLocal(currentDate), station?.thresholdConfig, this.authService.getAccessToken())
      .then((newChart: MapChart) => {
        this.chart = newChart;
      })
      .catch((err: Error) => {
        this.snackbarsService.createSnackbar(err.message, 'error', true);
      })
      .finally(() => {
        this.isChartLoading = false;
      })
  }

  public onChartCustomButtonClick(event: any[]): void {
    if (!Array.isArray(event)) return;
    const charts: MapChartData[] = event.filter((v: any) => v instanceof MapChartData);
    const csv = CSVUtils.convertTimestampValueArrayToCSV(charts.map((v) => v.data), ['Data', ...charts.map((v) => v.legend ?? '')]);
    Utils.downloadFile('station_chart.csv', csv);
  }
}
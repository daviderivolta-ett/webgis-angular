/* Dependencies */
import { Component, computed, effect, inject, ViewChild, OnInit } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'

/* Models */
import { MapChart, MapChartData, Sensor, SensorType, Settings, Station, StationBase, Table2, TableColorConfig, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, Tenant, TreeNode, User } from '../../../models'

/* Services */
import { ApiService, Auth2Service, GlobalStateService, SnackbarsService, StationsService, TenantsService } from '../../../services'

/* Components */
import { SidebarComponent, HeaderComponent, SortableTableComponent, SortHeaderComponent, FloatingDialogComponent, PlotlyChartComponent, NotificationIconComponent, DatePickerComponent } from '../../../components'

/* Directives */
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive'

/* Pipes */
import { IsDatePipe, MapValuePipe } from '../../../pipes'

/* Utils */
import { CSVUtils, DateUtils, Utils } from '../../../utils'
import { MapChartComponent } from '../../data/map-chart/map-chart.component'
import { MapChartDatepickerComponent } from '../../data/map-chart-datepicker/map-chart-datepicker.component'
import { MapChartSelectorComponent } from '../../data/map-chart-selector/map-chart-selector.component'

/* Types */
type PageTable = {
  id: string,
  label: string,
  table: Table2
}

/* Component */
@Component({
  selector: 'app-tables-extremes-page',
  imports: [
    /* Components */
    HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, NotificationIconComponent, DatePickerComponent,
    /* Directives */
    RouterLink, ScrollableTableDirective, RouterLinkActive,
    /* Pipes */
    MapValuePipe, IsDatePipe, DatePipe,
    FloatingDialogComponent,
    MapChartComponent,
    PlotlyChartComponent,
    MapChartDatepickerComponent,
    MapChartSelectorComponent
  ],
  templateUrl: './tables-extremes-page.component.html',
  styleUrl: './tables-extremes-page.component.scss'
})
export class TablesExtremesPageComponent implements OnInit {
  /* Dependency injection */
  private router: Router = inject(Router)
  private route: ActivatedRoute = inject(ActivatedRoute)
  private auth2Service: Auth2Service = inject(Auth2Service)
  private apiService: ApiService = inject(ApiService)
  private tenantsService: TenantsService = inject(TenantsService)
  private globalStateService: GlobalStateService = inject(GlobalStateService)
  private stationsService: StationsService = inject(StationsService)
  private snackbarsService: SnackbarsService = inject(SnackbarsService)

  /* User interface */
  public navGroups: TreeNode[] = [];
  public configGroup: TableConfigGroup | undefined;

  public referenceDate: Date | undefined;
  public selectedDate: Date | undefined;

  public tables: PageTable[] = [];
  public sortedTables: PageTable[] = [];

  public chart: MapChart | null = null;
  public isChartLoading: boolean = false;

  /* Data */
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

  /* References */
  @ViewChild('sidebar') _sidebar!: SidebarComponent;

  constructor() {
    /* Recovering from services */
    this._selectedTenant = this.tenantsService.selectedTenant;
    this.selectedTenantMsg = this.tenantsService.message;
    this.referenceDate = this.tenantsService.selectedTenant() ? new Date(this.tenantsService.selectedTenant()!.toDate) : undefined;

    /* Recovering data from resolvers */
    this.settings = this.route.snapshot.data['settings'];

    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.retentionBridgeUrl = this.route.snapshot.data['apisConfig'].get('retentionBridge');

    this._tableConfigGroups = this.route.snapshot.data['tableConfigGroups'];
    this.tableLabels = this.route.snapshot.data['tableLabels'];
    this._sensorTypes = this.route.snapshot.data['sensorTypes'];

    /* Effects */
    effect(() => {
      this.user = this.auth2Service.user();
      this._initNavbar();
    });
  }

  /* Component lifecycle */
  public async ngOnInit(): Promise<void> {
    this._initNavbar();
    await this.setDataFromApi();

    this.route.queryParams.subscribe(() => {
      const dateStr: string | undefined = this.globalStateService.getQueryParam2('date')[0];
      const date: Date | undefined = !isNaN(new Date(dateStr).getTime()) ? new Date(dateStr) : undefined;

      const tenantDate = this._selectedTenant() ? new Date(this._selectedTenant()!.toDate) : undefined;
      const newDate = !date && tenantDate ? tenantDate : date;

      this.selectedDate = !date && tenantDate ? tenantDate : date;
      this._init('estremi-temperatura-vento', newDate ?? new Date());
    });
  }

  /* Methods */
  public async setDataFromApi() {
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

    const res: unknown = await this._getData(this.configGroup.options[0], date);
    if (!res) return;
    this.tables = this.sortedTables = this._createTables(res, this.configGroup);
  }

  private _initConfigGroup(id: string): TableConfigGroup | undefined {
    const config: TableConfigGroup | undefined = this._tableConfigGroups.find(g => g.id === id);

    if (!config) {
      if (this._tableConfigGroups.length > 0) this.router.navigateByUrl(`/tabelle/${this._tableConfigGroups[0].options[0].id}`)
      return undefined;
    }
    return config;
  }

  private _reset(): void {
    this.tables = this.sortedTables = [];
  }

  private async _getData(config: TableConfig, date: Date): Promise<unknown> {
    const baseUrl: string = this.tenantsService.buildUrlWithTenant(this.stationsApiBaseUrl, this.retentionBridgeUrl, config.url);
    const url = date ?
      `${baseUrl}?time=${DateUtils.toApiFormat(date.toISOString())}` :
      `${baseUrl}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    this.isChartLoading = true;
    const response = await this.apiService.getApiData(url, this.auth2Service.token())
      .catch(() => {
        this.snackbarsService.createSnackbar(`Errore nel recupero dei dati delle tabelle.`, 'error', true);
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId);
        this.isChartLoading = false;
      })

    return (!Array.isArray(response) || response.length === 0) ? undefined : response;
  }

  private _createTables(data: unknown, configGroup: TableConfigGroup): PageTable[] {
    if (!Array.isArray(data)) return [];
    return data.map((t: unknown) => {
      if (typeof t !== 'object' || t === null || !('tableName' in t) || !('tableRows' in t)) return undefined;
      const { tableName, tableRows } = t;
      if (!tableName || typeof tableName !== 'string' || !tableRows || !Array.isArray(tableRows)) return undefined;
      const config: TableConfig | undefined = configGroup.options.find((c: TableConfig) => c.dataPath === tableName);
      if (!config) return undefined;

      const table = new Table2();
      const header = this._createTableHeader(tableRows, config.keysToKeep ?? []);
      table.header = Table2.orderTableHeader(header.filter(k => k !== 'firstValueReferenceDate' && k !== 'secondValueReferenceDate'), 'firstValueMunicipality', config.keysOrder);
      table.body = this._parseTableBody(tableRows, table.header, config.keysToMerge as unknown as string[][] ?? [], config.colors, config.decimals);
      table.labels = config.labels ?? new Map<string, string>();

      return {
        id: config.id,
        label: config.label ?? config.id,
        table
      }
    }).filter((d: unknown): d is PageTable => d !== undefined)
  }

  private _createTableHeader(data: unknown[], keysToKeep: string[]): string[] {
    return Array.from(
      new Set(
        data.flatMap((r: unknown) => {
          if (typeof r !== 'object' || r === null) return [];
          return Object.keys(r).filter(k => keysToKeep.includes(k))
        })
      )
    )
  }

  private _parseTableBody(data: any[], headerkeys: string[], keysToMerge: string[][], colors: TableColorConfig[] = [], decimals: number = 1): any[] {
    return data.map((r: any) => {

      const row: any[] = [];

      for (const key of headerkeys) {
        const colorConfig: TableColorConfig | undefined = colors.find((c) => c.key === key);

        if (!keysToMerge.flat().includes(key)) {
          row.push({
            dataKey: key,
            dataValue: key in r ? (typeof r[key] === 'number' ? r[key].toFixed(decimals) : r[key]) : '-',
            hiddenValue: key.includes('first') && r['firstValueStationCode'] ? r['firstValueStationCode'] :
              key.includes('second') && r['secondValueStationCode'] ? r['secondValueStationCode'] :
                undefined
          })
        } else {
          const mergeGroup: string[] | undefined = keysToMerge.find((s: string[]) => s.includes(key));
          if (!mergeGroup) {
            row.push({
              dataKey: key,
              dataValue: key in r ? (typeof r[key] === 'number' ? r[key].toFixed(decimals) : r[key]) : '-',
              hiddenValue: key.includes('first') && r['firstValueStationCode'] ? r['firstValueStationCode'] :
                key.includes('second') && r['secondValueStationCode'] ? r['secondValueStationCode'] :
                  undefined
            });
            continue;
          }

          if (key !== mergeGroup[0]) continue;

          const date: any = r[mergeGroup[1]];
          let hour: string = '00:00';
          if (date && !isNaN(new Date(date).getDate())) {
            const d = new Date(date);

            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');

            hour = `${hh}:${mm}`;
          }

          row.push({
            dataKey: mergeGroup[0],
            dataValue: `${typeof r[mergeGroup[0]] === 'number' ? r[mergeGroup[0]].toFixed(decimals) : r[mergeGroup[0]]} [${hour}]`,
            hiddenValue: key.includes('first') && r['firstValueStationCode'] ? r['firstValueStationCode'] :
              key.includes('second') && r['secondValueStationCode'] ? r['secondValueStationCode'] :
                undefined,
            backgroundColor: colorConfig ? colorConfig.getBackgroundColor(r[mergeGroup[0]]) : undefined
          })
        }

      }
      return row.filter((d) => Object.keys(d).length > 0);
    }).filter((d) => Object.keys(d).length > 0);
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

    if (date) this.globalStateService.updateQueryParam2('date', [this.globalStateService.toDatetimelocal(date)])
    else this.globalStateService.removeQueryParam('date')
  }

  public async onCellClick(cell: unknown, tableId: string): Promise<void> {
    if (typeof cell !== 'object' || cell === null || !('hiddenValue' in cell) || !('value' in cell) || typeof cell.value !== 'number') return;

    const hiddenValue = cell['hiddenValue'];
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
    const chart = this.stationsService.createChart(station, this._sensorTypes, foundSensor && foundSensor.thresholdKeys ? thresholds : {});
    this.chart = chart;
  }

  public async onChartParameterChange(stationCode: string, formChange: Record<string, string>): Promise<void> {
    let { initialDate, } = formChange;
    const { param, endingDate } = formChange;
    const currentDateStr: string | undefined = this.globalStateService.getQueryParam2('date')[0];
    const currentDate = !isNaN(new Date(currentDateStr).getTime()) ? new Date(currentDateStr) : new Date();

    if (!this.chart) return;

    this.isChartLoading = true;

    const station: StationBase | undefined = this.stations.find((s: StationBase) => s.id === stationCode);

    if (!initialDate) {
      const sensorType = this._sensorTypes.find((t) => t.id === param);
      initialDate = DateUtils.toDateTimeLocal(this.stationsService.getInitialDateOnSensorGap(endingDate, sensorType));
    }

    this.stationsService.updateChart(param, this.chart, this._sensorTypes, this.timeserieUrl(), initialDate, endingDate, DateUtils.toDateTimeLocal(currentDate), station?.thresholdConfig, this.auth2Service.token())
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

  public onChartCustomButtonClick(event: unknown[]): void {
    if (!Array.isArray(event)) return;
    const charts: MapChartData[] = event.filter((v: unknown) => v instanceof MapChartData);
    const csv = CSVUtils.convertTimestampValueArrayToCSV(charts.map((v) => v.data), ['Data', ...charts.map((v) => v.legend ?? '')]);
    Utils.downloadFile('station_chart.csv', csv);
  }
}
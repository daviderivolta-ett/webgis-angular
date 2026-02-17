/** Dependencies */
import { Component, effect, ViewChild } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'

/** Models */
import { MapChart, MapChartData, Sensor, SensorType, Station, StationBase, Table2, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode, User } from '../../../models'

/** Services */
import { ApiService, AuthService, GlobalStateService, SnackbarsService, StationsService } from '../../../services'

/** Components */
import { SidebarComponent, HeaderComponent, SortableTableComponent, SortHeaderComponent, DatepickerComponent, FloatingDialogComponent, PlotlyChartComponent } from '../../../components'

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
  selector: 'app-tables-extremes-page',
  imports: [
    /** Components */
    HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, DatepickerComponent,
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
  templateUrl: './tables-extremes-page.component.html',
  styleUrl: './tables-extremes-page.component.scss'
})
export class TablesExtremesPageComponent {
  /** User interface */
  public navGroups: TreeNode[] = [];
  public configGroup: TableConfigGroup | undefined;

  public initialDate: Date | undefined;
  public selectedDate: Date | undefined;

  public tables: PageTable[] = [];
  public sortedTables: PageTable[] = [];

  public chart: MapChart | null = null;
  public isChartLoading: boolean = false;

  /** Data */
  public user: User | null = null;

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public stationsUrl; // Recovered from route resolver in constructor
  public parametersUrl; // Recovered from route resolver in constructor 
  public stationParametersUrl; // Recovered from route resolver in constructor
  public timeserieUrl; // Recovered from route resolver in constructor

  public stations: StationBase[] = [];

  private _tableConfigGroups: TableConfigGroup[]; // Recovered from route resolver in constructor
  public tableLabels: Map<string, string>; // Recovered from route resolver in constructor
  private _sensorTypes: SensorType[]; // Recovered from route resolver in constructor

  /** References */
  @ViewChild('sidebar') _sidebar!: SidebarComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private globalStateService: GlobalStateService,
    private stationsService: StationsService,
    private snackbarsService: SnackbarsService
  ) {
    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.stationsUrl = apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('stations'));
    this.parametersUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('parameters'));
    this.stationParametersUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('stationParameters'));
    this.timeserieUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('timeseries'));
    this._tableConfigGroups = this.route.snapshot.data['tableConfigGroups'];
    this.tableLabels = this.route.snapshot.data['tableLabels'];
    this._sensorTypes = this.route.snapshot.data['sensorTypes'];

    /** Effects */
    effect(() => {
      this.user = this.authService.user();
      this._initNavbar();
    });

    // effect(() => {
    // const date = this.dateService.date();
    // const date = this.globalStateService.getDateFromQueryParams();
    // this.initialDate = date;
    // this.selectedDate = date;
    // this._init('estremi-temperatura-vento');
    // });
  }

  /** Component lifecycle */
  public async ngOnInit(): Promise<void> {
    this._initNavbar();
    await this.setDataFromApi();

    this.route.queryParams.subscribe(() => {
      const date = this.globalStateService.getDateFromQueryParams();
      this.initialDate = date;
      this.selectedDate = date;
      this._init('estremi-temperatura-vento');
    });
  }

  /** Methods */
  public async setDataFromApi() {
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
    }
  }

  private _initNavbar() {
    this.navGroups = this._tableConfigGroups
      .filter((g: TableConfigGroup) => !g.requiresAuth || this.user)
      .map((g: TableConfigGroup) => TableConfigGroupToTreeNodeAdapter.convert(g));
  }

  private async _init(id: string): Promise<void> {
    this._reset();
    if (this._sidebar) this._sidebar.toggleSidebar(false);

    this.configGroup = this._initConfigGroup(id);
    if (!this.configGroup) return;

    const res: any = await this._getData(this.configGroup.options[0]);
    if (!res) return;
    this.tables = this.sortedTables = this._createTables(res, this.configGroup);
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

  private async _getData(config: TableConfig): Promise<any> {
    const url = this.selectedDate ?
      `${this.stationsApiBaseUrl}${config.url}?time=${DateUtils.toApiFormat(this.selectedDate.toISOString())}` :
      `${this.stationsApiBaseUrl}${config.url}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    const response = await this.apiService.getApiData(url)
      .catch((err: any) => {
        this.snackbarsService.createSnackbar(`Errore nel recupero dei dati delle tabelle.`, 'error', true);
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId);
      })

    return (!Array.isArray(response) || response.length === 0) ? undefined : response;
  }

  private _createTables(data: any, configGroup: TableConfigGroup): PageTable[] {
    return data.map((t: any, i: number) => {
      const { tableName, tableRows } = t;
      if (!tableName || typeof tableName !== 'string' || !tableRows || !Array.isArray(tableRows)) return undefined;
      const config: TableConfig | undefined = configGroup.options.find((c: TableConfig) => c.dataPath === tableName);
      if (!config) return undefined;

      let table = new Table2();
      let header = this._createTableHeader(tableRows, config.keysToKeep ?? []);
      table.header = Table2.orderTableHeader(header.filter(k => k !== 'firstValueReferenceDate' && k !== 'secondValueReferenceDate'), 'region', config.keysOrder);
      table.body = this._parseTableBody(tableRows, header, config.keysToMerge as unknown as string[][] ?? [], config.decimals);
      table.labels = config.labels ?? new Map<string, string>();

      return {
        id: config.id,
        label: config.label ?? config.id,
        table
      }
    }).filter((d: unknown) => d !== undefined)
  }

  private _createTableHeader(data: any[], keysToKeep: string[]): string[] {
    return Array.from(
      new Set(
        data.flatMap((r: any) => {
          return Object.keys(r).filter(k => keysToKeep.includes(k))
        })
      )
    )
  }

  private _parseTableBody(data: any[], headerkeys: string[], keysToMerge: string[][], decimals: number = 1): any[] {
    return data.map((r: any) => {

      const row: any[] = [];

      for (const key of headerkeys) {
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
                undefined
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

  public onDateChange(event: any): void {
    const { date: dateString } = event;
    if (typeof dateString !== 'string') return;
    this.globalStateService.setDateToQueryParams(new Date(dateString));
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
    const { param, initialDate, endingDate } = formChange;
    // const currentDate = this.dateService.date() ?? new Date();
    const currentDate = this.globalStateService.getDateFromQueryParams() ?? new Date();

    if (!this.chart) return;

    this.isChartLoading = true;

    const station: StationBase | undefined = this.stations.find((s: StationBase) => s.id === stationCode);
    this.stationsService.updateChart(param, this.chart, this._sensorTypes, this.timeserieUrl, initialDate, endingDate, DateUtils.toDateTimeLocal(currentDate), station?.thresholdConfig, this.authService.getAccessToken())
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
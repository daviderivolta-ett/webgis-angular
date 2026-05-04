/** Dependencies */
import { Component, effect, ViewChild } from '@angular/core'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'

/** Models */
import { MapChart, MapChartData, Sensor, SensorType, Station, StationBase, Table2, TableColorConfig, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode, User } from '../../../models'

/** Services */
import { ApiService, AuthService, GlobalStateService, SnackbarsService, StationsService } from '../../../services'

/** Components */
import { SidebarComponent, HeaderComponent, SortableTableComponent, SortHeaderComponent, DatepickerComponent, FloatingDialogComponent, PlotlyChartComponent } from '../../../components'
import { MapChartComponent } from '../../data/map-chart/map-chart.component'

/** Directives */
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive'

/** Pipes */
import { MapValuePipe } from '../../../pipes'

/** Utils */
import { CSVUtils, DateUtils, Utils } from '../../../utils'
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
  selector: 'app-tables-max-page',
  imports: [
    /** Components */
    HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, DatepickerComponent, FloatingDialogComponent, MapChartComponent, PlotlyChartComponent,
    /** Directives */
    RouterLink, ScrollableTableDirective, RouterLinkActive,
    /** Pipes */
    MapValuePipe,
    MapChartDatepickerComponent,
    MapChartSelectorComponent
  ],
  templateUrl: './tables-max-page.component.html',
  styleUrl: './tables-max-page.component.scss'
})
export class TablesMaxPageComponent {
  /** User interface */
  public navGroups: TreeNode[] = [];
  public configGroup: TableConfigGroup | undefined;
  public config: TableConfig | undefined;

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
  }

  /** Component lifecycle */
  public async ngOnInit(): Promise<void> {
    this._initNavbar();
    await this.setDataFromApi();

    this.route.queryParams.subscribe(() => {
      const dateStr: string | undefined = this.globalStateService.getQueryParam2('date')[0];
      const date: Date | undefined = !isNaN(new Date(dateStr).getTime()) ? new Date(dateStr) : undefined;
      this.selectedDate = this.initialDate = date;
      this._init('massimi-precipitazione', date ?? new Date());
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

  private async _init(id: string, date: Date): Promise<void> {
    this._reset();
    if (this._sidebar) this._sidebar.toggleSidebar(false);

    this.configGroup = this._initConfigGroup(id);
    if (!this.configGroup) return;

    const res: any = await this._getData(this.configGroup.options[0], date);
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

  private async _getData(config: TableConfig, date: Date): Promise<any> {
    const url = date ?
      `${this.stationsApiBaseUrl}${config.url}?time=${DateUtils.toApiFormat(date.toISOString())}` :
      `${this.stationsApiBaseUrl}${config.url}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    this.isChartLoading = true;
    const response = await this.apiService.getApiData(url)
      .catch(() => {
        this.snackbarsService.createSnackbar(`Errore nel recupero dei dati delle tabelle.`, 'error', true);
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId);
        this.isChartLoading = false;
      })

    return (!Array.isArray(response) || response.length === 0) ? undefined : response;
  }

  private _createTables(data: any, configGroup: TableConfigGroup): PageTable[] {
    return data.map((t: any) => {
      const { tableName, tableRows } = t;
      if (!tableName || typeof tableName !== 'string' || !tableRows || !Array.isArray(tableRows)) return undefined;
      const config: TableConfig | undefined = configGroup.options.find((c: TableConfig) => c.dataPath === tableName);
      if (!config) return undefined;

      let table = new Table2();
      let header = this._createTableHeader(tableRows, 'values', 'parameter');
      table.header = Table2.orderTableHeader(header, 'name', config.keysOrder);
      table.body = this._parseTableBody(tableRows, 'values', table.header, config.keysToMerge ?? [], config.actionKey ?? '', config.colors ?? [], config.decimals);
      table.labels = config.labels ?? new Map<string, string>();

      return {
        id: config.id,
        label: config.label ?? config.id,
        table
      }
    }).filter((d: unknown) => d !== undefined)
  }

  private _createTableHeader(data: any[], fieldToSearch: string, valueField: string): string[] {
    return Array.from(
      new Set(
        data.flatMap((r: any) => {
          if (!(fieldToSearch in r)) return [];

          const values = r[fieldToSearch];
          const rest = { ...r };
          delete rest[fieldToSearch];

          if (!Array.isArray(values)) {
            return Object.keys(rest);
          }

          return [
            ...Object.keys(rest),
            ...values.map((d: any) => String(d[valueField]))
          ];
        })
      )
    )
  }

  private _parseTableBody(data: any[], fieldToSearch: string, headerkeys: string[], keysToMerge: string[], hiddenKey: string, colors: TableColorConfig[], decimals: number = 1): any[] {
    return data.map((r: any) => {
      if (fieldToSearch in r) {
        const values = r[fieldToSearch];
        const rest = { ...r };
        delete rest[fieldToSearch];

        if (!Array.isArray(values)) return { ...rest };

        const row: any[] = [];

        headerkeys.forEach((key: string) => {
          let cell = null;

          const colorConfig: TableColorConfig | undefined = colors.find((c) => c.key === key);

          // cerca in rest
          if (key in rest) {
            cell = {
              dataKey: key,
              dataValue: rest[key],
              hiddenValue: colorConfig ? colorConfig.getBackgroundColor(rest['lastValue']) : undefined
            };
          }

          // cerca in values (solo se non trovata)
          if (!cell) {
            const found = values.find((d: any) => d.parameter === key);

            if (found) {
              const { parameter, ...r } = found;
              const entries = Object.entries(r);

              let value = '';
              keysToMerge.forEach((k: string, i: number) => {
                const pair: [string, any] | undefined = entries.find(([kk]) => kk === k);
                if (pair) {
                  const isDate = Table2._isISODate(pair[1]);
                  value += isDate ?
                    ` [${new Date(pair[1]).getHours().toString().padStart(2, '0')}:${new Date(pair[1]).getMinutes().toString().padStart(2, '0')}]<br>` :
                    i === 0 ?
                      ` <strong>${typeof pair[1] === 'number' ? pair[1].toFixed(decimals) : pair[1]}</strong><br>` :
                      ` ${typeof pair[1] === 'number' ? pair[1].toFixed(decimals) : pair[1]}`;
                }
              });

              cell = {
                dataKey: key,
                dataValue: value,
                hiddenValue: found[hiddenKey],
                backgroundColor: colorConfig ? colorConfig.getBackgroundColor(found['lastValue']) : undefined
              };
            }
          }

          // fallback: valore mancante
          if (!cell) {
            cell = {
              dataKey: key,
              dataValue: '-',
              hiddenValue: undefined,
              backgroundColor: undefined
            };
          }

          row.push(cell);
        });

        return row;
      }
    });
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
    const current = this.globalStateService.getQueryParam2('date')[0];
    if (current === dateString) return;
    this.globalStateService.updateQueryParam2('date', dateString ? dateString : '');
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
/** Dependencies */
import { Component, effect, ViewChild } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'

/** Models */
import { MapChart, MapChartData, SensorType, Station, StationBase, Table2, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode, User } from '../../../models'

/** Services */
import { ApiService, AuthService, DateService, SnackbarsService, StationsService, TablesService } from '../../../services'

/** Components */
import { SidebarComponent, HeaderComponent, SortableTableComponent, SortHeaderComponent, DatepickerComponent, FloatingDialogComponent, PlotlyChartComponent } from '../../../components'

/** Directives */
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive'

/** Pipes */
import { IsDatePipe, MapValuePipe } from '../../../pipes'

/** Utils */
import { CSVUtils, DateUtils, Utils } from '../../../utils'
import { MapChartComponent } from "../../data/map-chart/map-chart.component";

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
    HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, DatepickerComponent,
    /** Directives */
    RouterLink, ScrollableTableDirective, RouterLinkActive,
    /** Pipes */
    MapValuePipe, IsDatePipe, DatePipe,
    FloatingDialogComponent,
    MapChartComponent,
    PlotlyChartComponent
],
  templateUrl: './tables-levels-page.component.html',
  styleUrl: './tables-levels-page.component.scss'
})
export class TablesLevelsPageComponent {
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
  public stationParametersUrl; // Recovered from route resolver in constructor
  public timeserieUrl; // Recovered from route resolver in constructor

  private _stations: Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>[] = [];

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
    private stationsService: StationsService,
    private dateService: DateService,
    private tablesService: TablesService,
    private snackbarsService: SnackbarsService
  ) {
    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
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

    effect(() => {
      const date = this.dateService.date();
      this.initialDate = date;
      this.selectedDate = date;
      this._init('livelli-idrometrici');
    });
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    this._initNavbar();
    this._getStationParameters();
  }

  /** Methods */
  private _initNavbar() {
    this.navGroups = this._tableConfigGroups
      .filter((g: TableConfigGroup) => !g.requiresAuth || this.user)
      .map((g: TableConfigGroup) => TableConfigGroupToTreeNodeAdapter.convert(g));
  }

  private async _getStationParameters(): Promise<void> {
    this.stationsService.getStationParameters(this.stationParametersUrl, this.authService.getAccessToken())
      .then((stations) => {
        this._stations = stations;
      })
      .catch((err: unknown) => {
        this.snackbarsService.createSnackbar(err instanceof Error ? err.message : `Errore nel recupero dei parametri delle stazioni.`, 'error', true);
      })
  }

  private async _init(id: string): Promise<void> {
    this._reset();
    if (this._sidebar) this._sidebar.toggleSidebar(false);

    this.configGroup = this._initConfigGroup(id);
    if (!this.configGroup) return;

    const res: any = await this._getData(this.configGroup.options[0]);
    if (!res) return;
    this.tables = this.sortedTables = this._createTables(res, this.configGroup);
    console.log(this.tables);
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
      `${this.stationsApiBaseUrl}${config.url}?date=${DateUtils.toUTCDate(this.selectedDate.toISOString())}` :
      `${this.stationsApiBaseUrl}${config.url}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    const response = await this.apiService.getApiData(url)
      .catch((err: any) => {
        throw new Error('Errore nel recupero dei dati', err);
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

      const rawData = this.tablesService.parseNestedTableData(tableRows, 'values', config.keysToMerge ?? []);
      const table = Table2.generateTableStructure(rawData, 'name', config.keysOrder, config.actionKey);

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
    const param: string | null = this.route.snapshot.paramMap.get('id');
    if (param) Utils.downloadFile(`${param}.csv`, csv);
  }

  public onDateChange(event: any): void {
    const { date: dateString } = event;
    if (typeof dateString !== 'string') return;
    this.dateService.date.set(!isNaN(new Date(dateString).getTime()) ? new Date(dateString) : undefined);
  }

  public async onCellClick(cell: any, tableId: string): Promise<void> {
    const hiddenValue: string | undefined = cell['hiddenValue'];
    if (!hiddenValue) return;

    const tableConfig = TableConfigGroup.findTableConfig(tableId, this._tableConfigGroups);
    if (!tableConfig) return;

    const stationPick = this._stations.find((s) => s.id === hiddenValue);
    if (!stationPick) return;
    const station: Station = Station.fromStationPick(stationPick);

    let chart = this.stationsService.createChart(station, []);
    this.chart = chart;
    this.isChartLoading = true;

    const dates: [string, string] = DateUtils.createDateRangeFromDate(this.selectedDate ?? new Date(), 3);
    this.stationsService.updateChart(tableConfig.parameter ?? '', chart, this._sensorTypes, this.timeserieUrl, dates[0], dates[1])
      .then((chart: MapChart) => {
        this.chart = chart;
      })
      .finally(() => {
        this.isChartLoading = false;
      })
  }

  public onChartCustomButtonClick(event: any[]): void {
    if (!Array.isArray(event)) return;
    const charts: MapChartData[] = event.filter((v: any) => v instanceof MapChartData);
    const csv = CSVUtils.convertTimestampValueArrayToCSV(charts.map((v) => v.data), ['Data', ...charts.map((v) => v.legend ?? '')]);
    Utils.downloadFile('massimi-precipitazione.csv', csv);
  }
}
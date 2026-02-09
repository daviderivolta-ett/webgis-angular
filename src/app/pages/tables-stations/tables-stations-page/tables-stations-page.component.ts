/** Dependencies */
import { Component, effect, ViewChild } from '@angular/core'
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'

/** Models */
import { MapChart, MapChartData, SensorType, Station, StationBase, Table2, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode, User } from '../../../models'

/** Services */
import { ApiService, AuthService, DateService, SnackbarsService, StationsService, TablesService } from '../../../services'

/** Components */
import { HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, InputAutocompleteComponent, DatepickerComponent, PlotlyChartComponent, FloatingDialogComponent } from '../../../components'
import { MapChartComponent } from '../../data/map-chart/map-chart.component';

/** Pipes */
import { MapValuePipe } from '../../../pipes'

/** Directives */
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive'

/** Utils */
import { CSVUtils, DateUtils, Utils } from '../../../utils'

/** Component */
@Component({
  selector: 'app-tables-stations-page',
  imports: [
    /** Components */
    HeaderComponent, SidebarComponent, InputAutocompleteComponent, DatepickerComponent, PlotlyChartComponent, MapChartComponent, FloatingDialogComponent,
    /** Directives */
    NgTemplateOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule, ScrollableTableDirective, SortableTableComponent, SortHeaderComponent,
    /** Pipes */
    KeyValuePipe, MapValuePipe
],
  templateUrl: './tables-stations-page.component.html',
  styleUrl: './tables-stations-page.component.scss'
})
export class TablesStationsPageComponent {
  /** User Interface */
  public form: FormGroup = new FormGroup({ select: new FormControl('') });
  public filters: FormGroup | null = null;

  public navGroups: TreeNode[] = [];
  public configGroup: TableConfigGroup | undefined;
  public config: TableConfig | undefined;

  public initialDate: Date | undefined;
  public selectedDate: Date | undefined;

  public chart: MapChart | null = null;
  public isChartLoading: boolean = false;

  /** Data */
  public user: User | null = null;

  public newData: Table2 = new Table2();
  public newSortedData: Table2 = new Table2();

  public filterKeys: Record<string, { id: string, label?: string }[]> = {};

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public stationsTableUrl; // Recovered from route resolver in constructor
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
    this.stationsTableUrl = this.route.snapshot.data['apisConfig'].get('tableStations');
    this.stationParametersUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('stationParameters'));
    this.timeserieUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('timeseries'));
    this._tableConfigGroups = this.route.snapshot.data['tableConfigGroups'];
    this.tableLabels = this.route.snapshot.data['tableLabels'];
    this._sensorTypes = this.route.snapshot.data['sensorTypes'];

    /** Effetcs */
    effect(() => {
      this.user = this.authService.user();
      this._initNavbar();
    });
    effect(() => {
      const date = this.dateService.date();
      this.initialDate = date;
      this.selectedDate = date;
      this._onGlobalDateChange();
    });
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    this._initNavbar();
    this.form.valueChanges.subscribe((changes) => this._onFormChange(changes));
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

    this._initForm(id);
    this.config = this._initConfig(id);
    if (!this.config) return;

    await this._getData(this.config)

    this.filterKeys = this._createFilterKeys(this.config.filterKeys ?? []);
    this.filters = this._createFilterForm(this.config.filterKeys ?? []);
    this.filters.valueChanges.subscribe((changes: any) => {
      this.newSortedData = this.newData.filterTableData(changes);
    });
  }

  private _initConfigGroup(id: string): TableConfigGroup | undefined {
    const config: TableConfigGroup | undefined = this._tableConfigGroups.find(g => g.options.some(c => c.id === id));
    if (!config) {
      this._tableConfigGroups.length > 0 ? this.router.navigateByUrl(`/tabelle/${this._tableConfigGroups[0].options[0].id}`) : '';
      return undefined;
    }
    return config;
  }

  private _initConfig(id: string): TableConfig | undefined {
    const config = TableConfigGroup.findTableConfig(id, this._tableConfigGroups);
    if (!config) {
      this._tableConfigGroups.length > 0 ? this.router.navigateByUrl(`/tabelle/${this._tableConfigGroups[0].options[0].id}`) : '';
      return undefined;
    }
    return config;
  }

  private _initForm(initialSelectValue: string) {
    this.form.get('select')?.setValue(initialSelectValue, { emitEvent: false });
  }

  private _onFormChange(changes: any) {
    const { select } = changes;
    if (!select || typeof select !== 'string') return;
    this._init(select);
  }

  private _reset(): void {  
    this.filters = null;
    this.newData = this.newSortedData = new Table2();
  }

  private async _getData(config: TableConfig): Promise<void> {
    const url = this.selectedDate ?
      `${this.stationsApiBaseUrl}${config.url}?date=${DateUtils.toApiFormat(this.selectedDate.toISOString())}` :
      `${this.stationsApiBaseUrl}${config.url}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    this.form.get('select')?.disable({ emitEvent: false });
    const response = await this.apiService.getApiData(url)
      .catch(() => {
        this.snackbarsService.createSnackbar(`Errore nel recupero dei dati delle tabelle.`, 'error', true);
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId)
        this.form.get('select')?.enable({ emitEvent: false });
      })

    if (!Array.isArray(response) || response.length === 0) return;
    const table: any = response[0];

    const { tableName, tableRows } = table;
    if (!tableName || typeof tableName !== 'string' || !tableRows || !Array.isArray(tableRows)) return;   
    const rawData = this.tablesService.parseNestedTableData(tableRows, 'values', config.keysToMerge ?? []);    
    this.newData = this.newSortedData = Table2.generateTableStructure(rawData, 'name', config.keysOrder, config.actionKey, config.labels, config.decimals);
  }

  public sortData(sort: { sortBy: string, direction: 'asc' | 'desc' | 'none' }): void {    
    this.newSortedData = this.newSortedData.sortTableData(sort.sortBy, sort.direction);
  }

  private _createFilterForm(filterKeys: string[]): FormGroup {
    const controls = filterKeys.reduce((acc: Record<string, any>, curr: string) => {
      acc[curr] = new FormControl('');
      return acc;
    }, {});
    return new FormGroup(controls);
  }

  private _createFilterKeys(filterKeys: string[]) {
    return filterKeys.reduce((acc: Record<string, { id: string, label?: string }[]>, curr: string) => {
      acc[curr] = this.newData.extractAllValuesByKey(curr).map((v: string) => ({ id: v }));
      return acc;
    }, {});
  }

  public onDownloadBtnClick(): void {
    const table = this.newData.convertTableToArray();
    const csv = CSVUtils.convertArrayToCSV(table, this.newData.header);
    Utils.downloadFile(`${this.config ? this.config.id : 'stazioni'}`, csv);
  }

  public onDateChange(event: any): void {
    const { date: dateString } = event;
    if (typeof dateString !== 'string') return;
    this.dateService.date.set(!isNaN(new Date(dateString).getTime()) ? new Date(dateString) : undefined);
  }

  private _onGlobalDateChange(): void {
    const selectedStation: any = this.form.get('select')?.value;
    if (selectedStation && typeof selectedStation === 'string') {
      this._init(selectedStation);
      return;
    }

    if (this._tableConfigGroups.length === 0 || this._tableConfigGroups[0].options.length === 0) return;
    this._init(this._tableConfigGroups[0].options[0].id);
  }

  public async onCellClick(cell: any): Promise<void> {
    const hiddenValue: string | undefined = cell['hiddenValue'];
    if (!hiddenValue) return;

    const stationPick = this._stations.find((s) => s.id === hiddenValue);
    if (!stationPick) return;
    const station: Station = Station.fromStationPick(stationPick);

    let chart = this.stationsService.createChart(station, []);
    this.chart = chart;
    this.isChartLoading = true;

    const dates: [string, string] = DateUtils.createDateRangeFromDate(this.selectedDate ?? new Date(), 3);
    const currentDate = this.dateService.date() ?? new Date();
    this.stationsService.updateChart(this.config && this.config.parameter ? this.config.parameter : '', chart, this._sensorTypes, this.timeserieUrl, dates[0], dates[1], DateUtils.toDateTimeLocal(currentDate))
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
    Utils.downloadFile('stazioni.csv', csv);
  }
}

/** Dependencies */
import { Component, effect, ViewChild } from '@angular/core'
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'

/** Models */
import { Table, Table2, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode, User } from '../../../models'

/** Services */
import { ApiService, AuthService, DateService, SnackbarsService, StationsService, TablesService } from '../../../services'

/** Components */
import { HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, InputAutocompleteComponent, DatepickerComponent } from '../../../components'

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
    HeaderComponent,
    SidebarComponent,
    InputAutocompleteComponent,
    /** Directives */
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    ScrollableTableDirective,
    SortableTableComponent,
    SortHeaderComponent,
    /** Pipes */
    KeyValuePipe,
    MapValuePipe,
    DatepickerComponent
  ],
  templateUrl: './tables-stations-page.component.html',
  styleUrl: './tables-stations-page.component.scss'
})
export class TablesStationsPageComponent {
  /** User Interface */
  public form: FormGroup = new FormGroup({ select: new FormControl('') });
  public filters: FormGroup | null = null;

  public areChartsDisabled: boolean = false;

  public navGroups: TreeNode[] = [];
  public configGroup: TableConfigGroup | undefined;
  public config: TableConfig | undefined;

  public initialDate: Date | undefined;
  public selectedDate: Date | undefined;

  /** Data */
  public user: User | null = null;

  public newData: Table2 = new Table2();
  public newSortedData: Table2 = new Table2();

  public filterKeys: Record<string, { id: string, label?: string }[]> = {};

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public stationsTableUrl; // Recovered from route resolver in constructor
  public timeserieUrl; // Recovered from route resolver in constructor
  private _tableConfigGroups: TableConfigGroup[]; // Recovered from route resolver in constructor
  public tableLabels: Map<string, string>; // Recovered from route resolver in constructor

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
    this.timeserieUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('timeseries'));
    this._tableConfigGroups = this.route.snapshot.data['tableConfigGroups'];
    this.tableLabels = this.route.snapshot.data['tableLabels'];

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
  }

  /** Methods */
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
    const config = this._tableConfigGroups
      .map((g: TableConfigGroup) => g.getTableConfig(id))
      .find((g) => g !== undefined);
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
      `${this.stationsApiBaseUrl}${config.url}?date=${DateUtils.toUTCDate(this.selectedDate.toISOString())}` :
      `${this.stationsApiBaseUrl}${config.url}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    this.form.get('select')?.disable({ emitEvent: false });
    const response = await this.apiService.getApiData(url)
      .catch((err: any) => {
        throw new Error('Errore nel recupero dei dati', err);
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
    this.newData = this.newSortedData = Table2.generateTableStructure(rawData, 'name', config.keysOrder, config.actionKey);
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

  public onCellClick(cell: any, keyToFind: string): void {
    const hiddenValue: string | undefined = cell['hiddenValue'];
    if (!hiddenValue) return;
    this.stationsService.getTimeSerie(this.timeserieUrl, hiddenValue, this.config && this.config.parameter ? this.config.parameter : '', [], '2025-12-30T20:00', '2025-12-31T20:00');
  }
}

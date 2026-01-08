/** Dependencies */
import { Component, effect, ViewChild } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'

/** Models */
import { Table, Table2, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode } from '../../../models'

/** Services */
import { ApiService, AuthService, DateService, SnackbarsService, TablesService } from '../../../services'

/** Components */
import { SidebarComponent, HeaderComponent, DatepickerComponent, SortableTableComponent } from '../../../components'

/** Directives */
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive'

/** Pipes */
import { IsDatePipe } from '../../../pipes'

/** Utils */
import { DateUtils, GeoJsonUtils } from '../../../utils'

/** Component */
@Component({
  selector: 'app-tables-hydro-page',
  imports: [
    /** Components */
    HeaderComponent,
    SidebarComponent,
    SortableTableComponent,
    /** Directives */
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    DatepickerComponent,
    ScrollableTableDirective,
    /** Pipes */
    IsDatePipe,
    DatePipe
  ],
  templateUrl: './tables-hydro-page.component.html',
  styleUrl: './tables-hydro-page.component.scss'
})
export class TablesHydroPageComponent {
  /** User Interface */
  public form: FormGroup = new FormGroup({ select: new FormControl('') });

  public navGroups: TreeNode[] = [];
  public configGroup: TableConfigGroup | undefined;
  public config: TableConfig | undefined;

  public initialDate: Date | undefined;
  public selectedDate: Date | undefined;

  /** Data */
  public user: Record<string, any> | null = null;

  public newData: Table2 = new Table2();
  public newSortedData: Table2 = new Table2();

  public data: Table = new Table();
  public sortedData: Table = new Table();

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  private _tableConfigGroups: TableConfigGroup[]; // Recovered from route resolver in constructor
  public tableLabels: Map<string, string>; // Recovered from route resolver in constructor

  /** References */
  @ViewChild('sidebar') _sidebar!: SidebarComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private dateService: DateService,
    private tablesService: TablesService,
    private snackbarsService: SnackbarsService
  ) {
    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this._tableConfigGroups = this.route.snapshot.data['tableConfigGroups'];
    this.tableLabels = this.route.snapshot.data['tableLabels'];

    /** Effects */
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
    this.newData = this.newSortedData = new Table2();
  }

  private async _getData(config: TableConfig): Promise<void> {
    const url = this.selectedDate ?
      `${this.stationsApiBaseUrl}${config.url}?date=${DateUtils.toUTCDate(this.selectedDate.toISOString())}` :
      `${this.stationsApiBaseUrl}${config.url}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    this.form.get('select')?.disable({ emitEvent: false });
    const response = await this.apiService.getApiData(url, this.authService.getAccessToken())
      .catch((err: any) => {
        throw new Error('Errore nel recupero dei dati', err);
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId)
        this.form.get('select')?.enable({ emitEvent: false });
      })

    if (!GeoJsonUtils.isGeoJSON(response)) return;
    const tableRows = GeoJsonUtils.fromGeoJSONToArraY(response);
    if (!tableRows || !Array.isArray(tableRows)) return;
    const filteredRows: any[] = this.tablesService.filterNestedTableData(tableRows, config.keysToKeep ?? []);
    const mergedRows: any[] = this.tablesService.mergeTableDataRowsByParam(filteredRows, 'basin', ['name', 'code']);
    this.newData = this.newSortedData = Table2.generateTableStructure(mergedRows, 'basin', config.keysOrder); 
  }

  public sortData(sort: { sortBy: string, direction: 'asc' | 'desc' | 'none' }): void {
    this.newSortedData = this.newSortedData.sortTableData(sort.sortBy, sort.direction);
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
    this._init('modelli-idrologici-nowcasting-hydro');
  }
}
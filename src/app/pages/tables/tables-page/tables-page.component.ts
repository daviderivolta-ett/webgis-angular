// Libraries
import { Component, effect, ViewChild } from '@angular/core';
import { DatePipe, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, ParamMap, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Models
import { Table, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode } from '../../../models';

// Services
import { ApiService, AuthService, SnackbarsService, TablesService } from '../../../services';

// Components
import { HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, InputAutocompleteComponent, DatepickerComponent } from '../../../components';

// Directives
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive';

/** Custom Pipes */
import { IsDatePipe, MapValuePipe } from '../../../pipes';

/** Utils */
import { CSVUtils, Utils } from '../../../utils';

// Component
@Component({
  selector: 'app-tables-page',
  imports: [
    // Libraries
    ReactiveFormsModule,
    // Components
    HeaderComponent,
    SidebarComponent,
    SortableTableComponent,
    SortHeaderComponent,
    InputAutocompleteComponent,
    // Pipes
    KeyValuePipe,
    DatePipe,
    IsDatePipe,
    MapValuePipe,
    // Directives
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    ScrollableTableDirective,
    DatepickerComponent
  ],
  templateUrl: './tables-page.component.html',
  styleUrl: './tables-page.component.scss'
})
export class TablesPageComponent {
  /** User Interface */
  public navGroups: TreeNode[] = [];
  public filters: FormGroup = new FormGroup({});

  public selectedTableTitle: string = '';
  public selectedDate: Date | undefined;

  /** Data */
  public user: Record<string, any> | null = null;

  public data: Table = new Table();
  public sortedData: Table = new Table();

  public apiBaseUrl; // Recovered from route resolver in constructor
  public stationsTableUrl; // Recovered from route resolver in constructor

  private _tableConfigGroups: TableConfigGroup[]; // Recovered from route resolver in constructor
  public tableLabels: Map<string, string>; // Recovered from route resolver in constructor

  public filterKeys: Record<string, { id: string, label?: string }[]> = {};

  /** References */
  @ViewChild('sidebar') _sidebar!: SidebarComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private tablesService: TablesService,
    private snackbarsService: SnackbarsService
  ) {
    // Get data from resolvers
    this.apiBaseUrl = this.route.snapshot.data['apisConfig'].get('baseUrl');
    this.stationsTableUrl = this.route.snapshot.data['apisConfig'].get('tableStations');
    this._tableConfigGroups = this.route.snapshot.data['tableConfigGroups'];
    this.tableLabels = this.route.snapshot.data['tableLabels'];

    /** Effetcs */
    effect(() => {
      this.user = this.authService.user();
    });
  }

  // Component lifecycle
  public async ngOnInit(): Promise<void> {
    this.navGroups = this._tableConfigGroups.map((g: TableConfigGroup) => TableConfigGroupToTreeNodeAdapter.convert(g));

    this.route.paramMap.subscribe((params: ParamMap) => {
      const param: string | null = this.route.snapshot.paramMap.get('id');
      if (param) this._init(param);
    });
  }

  // Methods
  private async _init(id: string): Promise<void> {
    if (this._sidebar) this._sidebar.toggleSidebar(false);

    const config: TableConfig | undefined = this._tableConfigGroups
      .map((g: TableConfigGroup) => g.getTableConfig(id))
      .find((g) => g !== undefined);

    if (!config) {
      this._tableConfigGroups.length > 0 ? this.router.navigateByUrl(`/tabelle/${this._tableConfigGroups[0].options[0].id}`) : '';
      return;
    }

    const url: string = this.selectedDate ?
      `${this.apiBaseUrl}${config.url}?date=${this.apiService.formatDate(this.selectedDate)}` :
      `${this.apiBaseUrl}${config.url}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');

    const response = await this.apiService.getApiData(url)
      .catch((err: any) => {
        throw new Error('Errore nel recupero dei dati', err);
      })
      .finally(() => this.snackbarsService.removeSnackbar(snackbarId))

    if (!Array.isArray(response)) return;
    const table = response.find((t: any) => t['tableName'] === config.dataPath);
    if (!table) return;

    const { tableName, tableRows } = table;
    if (!tableName || typeof tableName !== 'string' || !tableRows || !Array.isArray(tableRows)) return;

    this.selectedTableTitle = tableName;
    const rawData = this.tablesService.parseNestedTableData(tableRows, 'values', config.keysToMerge ?? []);
    this.data = this.sortedData = Table.generateTableStructure(rawData, 'name', config.keysOrder);

    this.filterKeys = this._createFilterKeys(config.filterKeys ?? []);
    this.filters = this._createFilterForm(config.filterKeys ?? []);

    this.filters.valueChanges.subscribe((changes: any) => {
      this.sortedData = this.data.filterTableData(changes);
    });
  }

  public sortData(sort: { sortBy: string, direction: 'asc' | 'desc' | 'none' }): void {
    this.sortedData = this.sortedData.sortTableData(sort.sortBy, sort.direction);
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
      acc[curr] = this.data.extractAllValuesByKey(curr).map((v: string) => ({ id: v }));
      return acc;
    }, {});
  }

  public onDownloadBtnClick(): void {
    const table = this.data.convertTableToArray();
    const csv = CSVUtils.convertArrayToCSV(table, this.data.header);
    const param: string | null = this.route.snapshot.paramMap.get('id');
    if (param) Utils.downloadFile(`${param}.csv`, csv);
  }

  public onDateChange(event: any): void {
    const { date: dateString } = event;
    if (typeof dateString !== 'string') return;
    this.selectedDate = !isNaN(new Date(dateString).getTime()) ? new Date(dateString) : undefined;
    const param: string | null = this.route.snapshot.paramMap.get('id');
    if (param) this._init(param);
  }
}
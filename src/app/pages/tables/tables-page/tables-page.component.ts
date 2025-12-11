/** Dependencies */
import { Component, effect, ViewChild } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'

/** Models */
import { Table, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode } from '../../../models'

/** Types */
type PageTable = {
  id: string,
  label: string,
  table: Table
}

/** Services */
import { ApiService, AuthService, SnackbarsService, TablesService } from '../../../services'

/** Components */
import { HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, DatepickerComponent } from '../../../components'

/** Pipes */
import { IsDatePipe, MapValuePipe } from '../../../pipes'

/** Directives */
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive'

/** Utils */
import { CSVUtils, Utils } from '../../../utils'

/** Component */
@Component({
  selector: 'app-tables-page',
  imports: [
    /** Components */
    HeaderComponent,
    SidebarComponent,
    /** Directives */
    RouterLink,
    RouterLinkActive,
    SortableTableComponent,
    ScrollableTableDirective,
    SortHeaderComponent,
    /** Pipes */
    DatePipe,
    MapValuePipe,
    IsDatePipe,
    DatepickerComponent
  ],
  templateUrl: './tables-page.component.html',
  styleUrl: './tables-page.component.scss'
})
export class TablesPageComponent {
  /** User Interface */
  public navGroups: TreeNode[] = [];
  public configGroup: TableConfigGroup | undefined;

  public selectedDate: Date | undefined;

  /** Data */
  public user: Record<string, any> | null = null;

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public stationsTableUrl; // Recovered from route resolver in constructor
  private _tableConfigGroups: TableConfigGroup[]; // Recovered from route resolver in constructor
  public tableLabels: Map<string, string>; // Recovered from route resolver in constructor

  public tables: PageTable[] = [];
  public sortedTables: PageTable[] = [];

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
    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.stationsTableUrl = this.route.snapshot.data['apisConfig'].get('tableStations');
    this._tableConfigGroups = this.route.snapshot.data['tableConfigGroups'];
    this.tableLabels = this.route.snapshot.data['tableLabels'];

    /** Effetcs */
    effect(() => {
      this.user = this.authService.user();
    });
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    this.navGroups = this._tableConfigGroups.map((g: TableConfigGroup) => TableConfigGroupToTreeNodeAdapter.convert(g));

    this.route.paramMap.subscribe(() => {
      const param: string | null = this.route.snapshot.paramMap.get('id');
      if (param) this._init(param);
    });
  }

  /** Methods */
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
      `${this.stationsApiBaseUrl}${config.url}?date=${this.apiService.formatDate(this.selectedDate)}` :
      `${this.stationsApiBaseUrl}${config.url}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    const response = await this.apiService.getApiData(url)
      .catch((err: any) => {
        throw new Error('Errore nel recupero dei dati', err);
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId);
      })

    // if (!Array.isArray(response) || response.length === 0) return;

    return (!Array.isArray(response) || response.length === 0) ? undefined : response;
  }

  private _createTables(data: any, configGroup: TableConfigGroup): PageTable[] {
    return data.map((t: any, i: number) => {
      const { tableName, tableRows } = t;
      if (!tableName || typeof tableName !== 'string' || !tableRows || !Array.isArray(tableRows)) return undefined;
      const config: TableConfig = configGroup.options[i];
      if (!config) return undefined;
      const rawData = this.tablesService.parseNestedTableData(tableRows, 'values', config.keysToMerge ?? []);
      const table: Table = Table.generateTableStructure(rawData, 'name', config.keysOrder);
      return {
        id: tableName,
        label: tableName,
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
    this.selectedDate = !isNaN(new Date(dateString).getTime()) ? new Date(dateString) : undefined;
    const param: string | null = this.route.snapshot.paramMap.get('id');
    if (param) this._init(param);
  }

  public onTableRowClick(row: [string, any][]): void {
    const code: any = row.find(([k, _]: [string, any]) => k === 'code')?.[1];
    if (!code) return;
  }
}

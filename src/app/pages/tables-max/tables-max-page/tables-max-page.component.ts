/** Dependencies */
import { Component, effect, ViewChild } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'

/** Models */
import { Table2, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode, User } from '../../../models'

/** Services */
import { ApiService, AuthService, DateService, SnackbarsService } from '../../../services'

/** Components */
import { SidebarComponent, HeaderComponent, SortableTableComponent, SortHeaderComponent, DatepickerComponent } from '../../../components'

/** Directives */
import { ScrollableTableDirective } from '../../../directives/scrollable-table.directive'

/** Pipes */
import { IsDatePipe, MapValuePipe } from '../../../pipes'

/** Utils */
import { CSVUtils, DateUtils, Utils } from '../../../utils'

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
    HeaderComponent, SidebarComponent, SortableTableComponent, SortHeaderComponent, DatepickerComponent,
    /** Directives */
    RouterLink, ScrollableTableDirective, RouterLinkActive,    
    /** Pipes */
    MapValuePipe, IsDatePipe, DatePipe
],
  templateUrl: './tables-max-page.component.html',
  styleUrl: './tables-max-page.component.scss'
})
export class TablesMaxPageComponent {
  /** User interface */
  public navGroups: TreeNode[] = [];
  public configGroup: TableConfigGroup | undefined;

  public initialDate: Date | undefined;
  public selectedDate: Date | undefined;

  /** Data */
  public user: User | null = null;

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
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
    private dateService: DateService,
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
      this._init('massimi-precipitazione');
    });
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    this._initNavbar();
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

      let table = new Table2();
      let header = this._createTableHeader(tableRows, 'values', 'parameter');
      table.header = this._orderTableHeader(header, 'name', config.keysOrder);
      table.body = this._parseTableBody(tableRows, 'values', header, config.keysToMerge ?? [], config.actionKey ?? '');

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

  private _orderTableHeader(header: string[], primaryKey?: string, keysOrder?: string[]): string[] {
    let orderedHeader = [...header];
    if (primaryKey && header.includes(primaryKey)) {
      orderedHeader = [primaryKey, ...header.filter((k: string) => k !== primaryKey)];
    }
    if (keysOrder && keysOrder.every((s: string) => header.includes(s))) {
      orderedHeader = [...keysOrder];
    }
    return orderedHeader;
  }

  private _parseTableBody(data: any[], fieldToSearch: string, headerkeys: string[], keysToMerge: string[], hiddenKey: string): any[] {
    return data.map((r: any) => {
      if (fieldToSearch in r) {
        const values = r[fieldToSearch];
        const rest = { ...r };
        delete rest[fieldToSearch];

        if (!Array.isArray(values)) return { ...rest };

        const row: any[] = [];

        headerkeys.forEach((key: string) => {
          let cell = null;

          // cerca in rest
          if (key in rest) {
            cell = {
              dataKey: key,
              dataValue: rest[key],
              hiddenValue: undefined
            };
          }

          // cerca in values (solo se non trovata)
          if (!cell) {
            const found = values.find((d: any) => d.parameter === key);

            if (found) {
              const { parameter, ...r } = found;
              const entries = Object.entries(r);

              let value = '';
              keysToMerge.forEach((k: string) => {
                const pair: [string, any] | undefined = entries.find(([kk]) => kk === k);
                if (pair) {
                  const isDate = Table2._isISODate(pair[1]);
                  value += isDate
                    ? ` [${new Date(pair[1]).getHours().toString().padStart(2, '0')}:${new Date(pair[1]).getMinutes().toString().padStart(2, '0')}]`
                    : ` ${pair[1]}`;
                }
              });

              cell = {
                dataKey: key,
                dataValue: value,
                hiddenValue: found[hiddenKey]
              };
            }
          }

          // fallback: valore mancante
          if (!cell) {
            cell = {
              dataKey: key,
              dataValue: '-',
              hiddenValue: undefined
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
    const param: string | null = this.route.snapshot.paramMap.get('id');
    if (param) Utils.downloadFile(`${param}.csv`, csv);
  }

  public onDateChange(event: any): void {
    const { date: dateString } = event;
    if (typeof dateString !== 'string') return;
    this.dateService.date.set(!isNaN(new Date(dateString).getTime()) ? new Date(dateString) : undefined);
  }
}
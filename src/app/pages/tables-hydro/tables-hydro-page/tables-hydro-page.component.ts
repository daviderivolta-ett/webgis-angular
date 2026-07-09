/** Dependencies */
import { Component, computed, effect, ViewChild } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'

/** Models */
import { ColorScale, ColorScaleBase, Settings, Station, StationBase, Table, Table2, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, Tenant, TreeNode, User } from '../../../models'

/** Services */
import { ApiService, Auth2Service, AuthService, GlobalStateService, SnackbarsService, StationsService, TablesService, TenantsService } from '../../../services'

/** Components */
import { SidebarComponent, HeaderComponent, DatepickerComponent, SortableTableComponent, FloatingDialogComponent, NotificationIconComponent, DatePickerComponent } from '../../../components'

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
    NotificationIconComponent,
    /** Directives */
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    DatePickerComponent,
    ScrollableTableDirective,
    /** Pipes */
    IsDatePipe,
    DatePipe,
    FloatingDialogComponent
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

  public referenceDate: Date | undefined;
  public selectedDate: Date | undefined;

  public hydroImg: string | null = null;
  public isLoading: boolean = false;

  /** Data */
  public user: User | null = null;
  public settings: Settings; // Recovered from route resolver in constructor

  public newData: Table2 = new Table2();
  public newSortedData: Table2 = new Table2();
  public tableHeader: string[] = [];

  public data: Table = new Table();
  public sortedData: Table = new Table();

  private _stations: Station[] = [];

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public retentionBridgeUrl; // Recovered from route resolver in constructor

  public hydroImgsUrl = computed(() => this.tenantsService.buildUrlWithTenant(this.stationsApiBaseUrl, this.retentionBridgeUrl, this.route.snapshot.data['apisConfig'].get('hydroImgs')));

  public baseColorScales: ColorScaleBase[];
  private _tableConfigGroups: TableConfigGroup[]; // Recovered from route resolver in constructor
  public tableLabels: Map<string, string>; // Recovered from route resolver in constructor

  private _selectedTenant; // Recovered from service in constructor
  public selectedTenantMsg; // Recovered from service in constructor
  public timePlayerRange = computed(() => {
    const selectedTenant: Tenant | null = this._selectedTenant();
    if (!selectedTenant) return this.settings.timeRangeDays ? this.settings.timeRangeDays * 1440 : 30 * 1440;
    return DateUtils.minutesBetweenTwoDates(new Date(selectedTenant.toDate), new Date(selectedTenant.fromDate));
  });

  /** References */
  @ViewChild('sidebar') _sidebar!: SidebarComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private auth2Service: Auth2Service,
    private apiService: ApiService,
    private tenantsService: TenantsService,
    private globalStateService: GlobalStateService,
    private stationsService: StationsService,
    private tablesService: TablesService,
    private snackbarsService: SnackbarsService
  ) {
    /** Recovering from services */
    this._selectedTenant = this.tenantsService.selectedTenant;
    this.selectedTenantMsg = this.tenantsService.message;
    this.referenceDate = this.tenantsService.selectedTenant() ? new Date(this.tenantsService.selectedTenant()!.toDate) : undefined;

    /** Recovering data from resolvers */
    this.settings = this.route.snapshot.data['settings'];
    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.retentionBridgeUrl = this.route.snapshot.data['apisConfig'].get('retentionBridge');

    // this.hydroImgsUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('hydroImgs'));
    this.baseColorScales = this.route.snapshot.data['colorScales'];
    this._tableConfigGroups = this.route.snapshot.data['tableConfigGroups'];
    this.tableLabels = this.route.snapshot.data['tableLabels'];

    /** Effects */
    effect(() => {
      this.user = this.auth2Service.user();
      this._initNavbar();
    });
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    this._initNavbar();
    this.form.valueChanges.subscribe((changes) => this._onFormChange(changes));

    this.route.queryParams.subscribe(() => {
      const tableId: string | undefined = this.globalStateService.hasInterestingQueryParams2(['table-hydro']) ? this.globalStateService.getQueryParam2('table-hydro')[0] : this._getSelectedModel();
      if (!tableId) return;
      this.form.patchValue({ select: tableId }, { emitEvent: false });
      const dateStr: string | undefined = this.globalStateService.getQueryParam2('date')[0];
      const date: Date | undefined = !isNaN(new Date(dateStr).getTime()) ? new Date(dateStr) : undefined;

      const tenantDate = this._selectedTenant() ? new Date(this._selectedTenant()!.toDate) : undefined;
      const newDate = !date && tenantDate ? tenantDate : date;

      this.selectedDate = !date && tenantDate ? tenantDate : date;
      this._init(tableId, newDate ?? new Date());
    });
  }

  /** Methods */
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

    this._initForm(id);
    this.config = this._initConfig(id);
    if (!this.config) return;

    await this._getData(this.config, date)
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
    this.globalStateService.updateQueryParam2('table-hydro', [select]);
  }

  private _reset(): void {
    this.newData = this.newSortedData = new Table2();
  }

  private async _getData(config: TableConfig, date: Date): Promise<void> {
    const baseUrl: string = this.tenantsService.buildUrlWithTenant(this.stationsApiBaseUrl, this.retentionBridgeUrl, config.url);
    const url = date ?
      `${baseUrl}?time=${DateUtils.toApiFormat(date.toISOString())}` :
      `${baseUrl}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    this.form.get('select')?.disable({ emitEvent: false });
    this.isLoading = true;
    let response = await this.apiService.getApiData(url, this.auth2Service.token())
      .catch((err: any) => {
        this.snackbarsService.createSnackbar(`Errore nel recupero dei dati delle tabelle.`, 'error', true);
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId)
        this.form.get('select')?.enable({ emitEvent: false });
        this.isLoading = false;
      })

    if (!GeoJsonUtils.isGeoJSON(response)) return;

    this._stations = (response as GeoJSON.FeatureCollection).features.map((f) => {
      if (!f.geometry || f.geometry.type !== 'Point' || !f.properties) return null;
      const stationBase = StationBase.createFromGeoJSONProps({ ...f.properties, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] });
      const stationData = Station.createStationDataFromGeoJSONProps({ ...f.properties, value: 0 });
      return Station.fromStationData(stationBase, stationData);
    }).filter((s) => s !== null);

    const colorScale: ColorScaleBase | undefined = this.baseColorScales.find((s) => s.id === 'hydro');
    if (colorScale) response = this._addColorToGeoJSONFeatures(response, new ColorScale(colorScale, { layerId: '', colorScaleId: '', steps: [-2, -1, 0, 1, 2, 3, 4] }));

    const tableRows = GeoJsonUtils.fromGeoJSONToArray(response);
    if (!tableRows || !Array.isArray(tableRows)) return;
    const filteredRows: any[] = this.tablesService.filterNestedTableData(tableRows, config.keysToKeep ?? []);
    const mergedRows: any[] = this.tablesService.mergeTableDataRowsByParam(filteredRows, 'basin', ['name', 'code']);
    const table = Table2.generateTableStructure(mergedRows, 'basin', config.keysOrder);
    table.body = this._parseTableBody(table.body, 'name', 'code');
    if (colorScale) table.body = this._addBackgroundColorToTableData(table.body, response);
    this.newData = this.newSortedData = table.cloneTable();
    this.tableHeader = new Array(table.body[0].length).fill('');
    this.tableHeader[0] = 'Bacino';
    this.tableHeader[1] = 'Sezioni';
  }

  public sortData(sort: { sortBy: string, direction: 'asc' | 'desc' | 'none' }): void {
    this.newSortedData = this.newSortedData.sortTableData(sort.sortBy, sort.direction);
  }

  private _addColorToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection, colorScale: ColorScale): GeoJSON.FeatureCollection {
    return {
      ...geoJSON,
      features: geoJSON.features.map((f: GeoJSON.Feature) => {
        const properties: any = f.properties ?? {};
        const colorCode = properties['alert'];
        const color: string = colorScale.getColor(colorCode ?? 0);

        return {
          ...f,
          properties: {
            ...properties,
            color
          }
        }
      })

    };
  }

  private _parseTableBody(data: any[][], dataPrefix: string, hiddenPrefix: string): any[] {
    return data.map((row: any[]) => {
      return row.reduce((acc: any[], curr: any) => {
        const key: string = curr.dataKey;

        // niente numero → lo teniamo
        if (!key.includes(dataPrefix) && !key.includes(hiddenPrefix)) {
          acc.push(curr);
          return acc;
        }

        // è un code → lo scartiamo
        if (key.includes(hiddenPrefix)) return acc;

        // è un name → cerchiamo il code
        const index = key.replace(dataPrefix, '');
        const hidden = row.find(el => el.dataKey === `${hiddenPrefix}${index}`);

        acc.push({
          ...curr,
          hiddenValue: hidden?.dataValue
        });

        return acc;
      }, []);
    });
  }

  private _addBackgroundColorToTableData(body: any[][], geojson: GeoJSON.FeatureCollection): any[][] {
    return body.map((row: any[]) => {
      return row.map((el: any) => {
        if (!('hiddenValue' in el) || typeof el['hiddenValue'] !== 'string') return { ...el, backgroundColor: 'white' };
        const feature: GeoJSON.Feature | undefined = geojson.features.find((f) => f.properties && f.properties['code'] === el['hiddenValue']);
        if (!feature || !feature.properties || !('color' in feature.properties)) return { ...el, backgroundColor: 'white' };
        return { ...el, backgroundColor: feature.properties['color'] };
      }).filter((el) => el !== null)
    });
  }

  public onDateChange(date: Date | undefined): void {
    const current: Date | undefined = this.globalStateService.getDateFromQueryParams();
    if (current?.getTime() === date?.getTime()) return;
    date ?
      this.globalStateService.updateQueryParam2('date', [this.globalStateService.toDatetimelocal(date)]) :
      this.globalStateService.removeQueryParam('date');
  }

  private _getSelectedModel(): string | undefined {
    if (this._tableConfigGroups.length === 0 || this._tableConfigGroups[0].options.length === 0) return undefined;
    const selectedModel: unknown = this.form.get('select')?.value;
    if (selectedModel && typeof selectedModel === 'string') return selectedModel;
    return 'modelli-idrologici-nowcasting-hydro';
  }

  public async onCellClick(cell: any) {
    if (!this.config) return;

    const hiddenValue: string | undefined = cell['hiddenValue'];
    if (!hiddenValue) return;

    const station: Station | undefined = this._stations.find((s) => s.id === hiddenValue);
    const date = this.stationsService.getHydroDateFromSubfolder(this.globalStateService.getDateFromQueryParams() ?? new Date(), station && station.subfolder ? station.subfolder : '');
    const snackbarId = this.snackbarsService.createSnackbar(`Recupero grafici idro`, 'loader');
    const url: string = this.tenantsService.buildUrlWithTenant(this.stationsApiBaseUrl, this.retentionBridgeUrl, this.config.url);
    this.stationsService.getHydroImageAt(url, '', hiddenValue, date, this.auth2Service.token())
      .then((img: any) => {
        this.hydroImg = img;
      })
      .catch((err: unknown) => {
        this.snackbarsService.createSnackbar(err instanceof Error ? err.message : `Errore nel recupero dell'immagine dell'hydro.`, 'error', true);
      })
      .finally(() => this.snackbarsService.removeSnackbar(snackbarId))
  }
}
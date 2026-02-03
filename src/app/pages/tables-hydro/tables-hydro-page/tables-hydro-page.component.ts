/** Dependencies */
import { Component, effect, ViewChild } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'

/** Models */
import { ColorScale, ColorScaleBase, Station, StationBase, Table, Table2, TableConfig, TableConfigGroup, TableConfigGroupToTreeNodeAdapter, TreeNode, User } from '../../../models'

/** Services */
import { ApiService, AuthService, DateService, SnackbarsService, StationsService, TablesService } from '../../../services'

/** Components */
import { SidebarComponent, HeaderComponent, DatepickerComponent, SortableTableComponent, FloatingDialogComponent } from '../../../components'

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

  public initialDate: Date | undefined;
  public selectedDate: Date | undefined;

  public hydroImg: string | null = null;

  /** Data */
  public user: User | null = null;

  public newData: Table2 = new Table2();
  public newSortedData: Table2 = new Table2();
  public tableHeader: string[] = [];

  public data: Table = new Table();
  public sortedData: Table = new Table();

  private _stations: Station[] = [];

  public stationsApiBaseUrl; // Recovered from route resolver in constructor
  public hydroImgsUrl; // Recovered from route resolver in constructor

  public baseColorScales: ColorScaleBase[];
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
    private stationsService: StationsService,
    private tablesService: TablesService,
    private snackbarsService: SnackbarsService
  ) {
    this.stationsApiBaseUrl = this.apiService.buildUrl(this.route.snapshot.data['apisConfig'].get('baseUrl'), this.route.snapshot.data['apisConfig'].get('stationsApi'));
    this.hydroImgsUrl = this.apiService.buildUrl(this.stationsApiBaseUrl, this.route.snapshot.data['apisConfig'].get('hydroImgs'));
    this.baseColorScales = this.route.snapshot.data['colorScales'];
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
      `${this.stationsApiBaseUrl}${config.url}?time=${DateUtils.toApiFormat(this.selectedDate.toISOString())}` :
      `${this.stationsApiBaseUrl}${config.url}`;

    const snackbarId: string = this.snackbarsService.createSnackbar('Caricamento dati tabella...', 'loader');
    this.form.get('select')?.disable({ emitEvent: false });
    let response = await this.apiService.getApiData(url, this.authService.getAccessToken())
      .catch((err: any) => {
        this.snackbarsService.createSnackbar(`Errore nel recupero dei dati delle tabelle.`, 'error', true);
      })
      .finally(() => {
        this.snackbarsService.removeSnackbar(snackbarId)
        this.form.get('select')?.enable({ emitEvent: false });
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

  public onDateChange(event: any): void {
    const { date: dateString } = event;
    if (typeof dateString !== 'string') return;
    this.dateService.date.set(!isNaN(new Date(dateString).getTime()) ? new Date(dateString) : undefined);
  }

  public async onCellClick(cell: any) {
    if (!this.config) return;

    const hiddenValue: string | undefined = cell['hiddenValue'];
    if (!hiddenValue) return;

    const station: Station | undefined = this._stations.find((s) => s.id === hiddenValue);
    const date = this.stationsService.getHydroDateFromSubfolder(this.dateService.date() ?? new Date(), station && station.subfolder ? station.subfolder : '');
    const snackbarId = this.snackbarsService.createSnackbar(`Recupero grafici idro`, 'loader');
    this.stationsService.getHydroImageAt(`${this.stationsApiBaseUrl}${this.config.url}`, '', hiddenValue, date, this.authService.getAccessToken())
      .then((img: any) => {
        this.hydroImg = img;
      })
      .catch((err: unknown) => {
        this.snackbarsService.createSnackbar(err instanceof Error ? err.message : `Errore nel recupero dell'immagine dell'hydro.`, 'error', true);
      })
      .finally(() => this.snackbarsService.removeSnackbar(snackbarId))
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